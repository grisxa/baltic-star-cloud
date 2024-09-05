import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Timestamp} from 'firebase/firestore';
import * as mapboxGL from 'mapbox-gl';
import {Popup} from 'mapbox-gl';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {NONE_BREVET} from '../../models/brevet';
import {CheckIns, Checkpoint, orderCheckpointsByDistance, orderCheckpointsByVisit} from '../../models/checkpoint';
import {BarcodeQueueService} from '../../services/barcode-queue.service';
import {StorageService} from '../../services/storage.service';
import {drawJsonRoute} from '../common';
import LngLat = mapboxGL.LngLat;

import {environment} from '../../../environments/environment';

const DEFAULT_CENTER = new LngLat(30.317, 59.95);

type MapboxLocationDialogSettings = {
  geoJSON: any;
  center: LngLat;
  checkpoints?: Checkpoint[];
  brevetUid: string;
};

@Component({
  selector: 'app-mapbox-dialog',
  templateUrl: './mapbox-location-dialog.component.html',
  styleUrls: ['./mapbox-location-dialog.component.scss']
})
export class MapboxLocationDialogComponent implements OnInit, OnDestroy {
  map!: mapboxGL.Map;
  geoLocate!: mapboxGL.GeolocateControl;
  checkpointsAround?: Checkpoint[];
  checkpointControl: FormControl;
  errorTimeout?: any;
  archive?: CheckIns;

  private locationStarted = false;
  private selectedCheckpointUid?: string;
  private unsubscribe$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: MapboxLocationDialogSettings,
              private storage: StorageService,
              private queue: BarcodeQueueService
  ) {
    this.checkpointControl = new FormControl({value: null, disabled: true},
      Validators.required);
  }

  ngOnInit(): void {
    this.archive = this.queue.listQueue().reduce(
      (acc: CheckIns, checkIn) => {
        acc[checkIn.code] = acc[checkIn.code] ? [...acc[checkIn.code], checkIn.time].sort() : [checkIn.time];
        return acc;
      },
      {} as CheckIns
    );
    // @ts-ignore
    mapboxGL.accessToken = environment.mapbox.accessToken;
    this.map = new mapboxGL.Map({
      container: 'mapbox',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 14,
      center: this.validPoint(this.data.center) ? this.data.center : DEFAULT_CENTER,
    });
    this.map.addControl(new mapboxGL.NavigationControl());
    this.checkpointControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => this.selectedCheckpointUid = value);

    this.data
      // skip broken coordinates
      .checkpoints?.filter(cp => cp.coordinates?.longitude && cp.coordinates?.latitude)
      .forEach(cp => new Popup({
        // offset: 30,
        closeButton: false,
        closeOnClick: false,
        focusAfterOpen: false,
        anchor: 'bottom',
        className: 'popup',
      }).setHTML(cp.name || cp.displayName || 'КП')
        // @ts-ignore
        .setLngLat(new LngLat(cp.coordinates.longitude, cp.coordinates.latitude))
        .addTo(this.map));


    this.geoLocate = new mapboxGL.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    this.map.addControl(this.geoLocate);
    this.geoLocate.on('geolocate', this.onLocationChanged.bind(this));
    this.geoLocate.on('trackuserlocationstart', () => {
      this.locationStarted = true;
    });

    this.map.on('load', () => drawJsonRoute(this.map, this.data.geoJSON));

    // wait for 0.5 sec and start location
    this.errorTimeout = setTimeout(() => this.locationStarted ||
      this.geoLocate.trigger(), 500);

    this.map.on('idle', () => {
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
      }
      if (!this.locationStarted) {
        this.geoLocate.trigger();
      }
    });
  }

  ngOnDestroy() {
    // stop monitoring
    this.map.removeControl(this.geoLocate);
    this.unsubscribe$.next();
  }

  onLocationChanged(event: unknown) {
    const location: GeolocationPosition = event as GeolocationPosition;
    const {timestamp, coords} = location;
    const quickResult: Checkpoint[] | undefined = this.quickSearch(coords, this.data.checkpoints);
    if (quickResult) {
      // sort them by the distance, then by the previous check-in
      // TODO: || orderCheckpointsByTime(a, b, Date.now()) ||
      const checkpoints = quickResult.sort((a, b) => orderCheckpointsByDistance(a, b) || orderCheckpointsByVisit(a, b, this.archive));
      this.checkpointsAround = checkpoints;
      if (checkpoints.length) {
        this.checkpointControl.enable();
        this.checkpointControl.setValue(this.validateSelection(checkpoints, this.selectedCheckpointUid));
      } else {
        this.checkpointControl.disable();
        this.checkpointControl.setValue(null);
      }
    }

    this.storage.listCloseCheckpoints(location)
      .then(docs => docs
        .map((doc): Checkpoint => Object.assign({} as Checkpoint,
          // add a distance
          doc, {
            delta: geoDistance(
              doc.coordinates?.latitude || 0,
              doc.coordinates?.longitude || 0,
              location.coords.latitude,
              location.coords.longitude)
          })))
      // sort them by the distance, then by the previous check-in
      // TODO: || orderCheckpointsByTime(a, b, Date.now()) ||
      .then(checkpoints => checkpoints.sort((a, b) => orderCheckpointsByDistance(a, b) || orderCheckpointsByVisit(a, b, this.archive)))
      // skip checkpoints not in the brevet
      .then(checkpoints => this.storage
        .filterCheckpoints(this.data.brevetUid || NONE_BREVET, checkpoints))
      .then(checkpoints => {
        this.checkpointsAround = checkpoints;
        if (checkpoints.length) {
          this.checkpointControl.enable();
          this.checkpointControl.setValue(this.validateSelection(checkpoints, this.selectedCheckpointUid));
        } else {
          this.checkpointControl.disable();
          this.checkpointControl.setValue(null);
        }
      });
  }

  /**
   * Keep control point within 1200 m and online
   *
   * @param center - the position
   * @param checkpoints - a list of control points with coordinates
   * @return a list of the closest checkpoints
   */
  quickSearch(center: GeolocationCoordinates, checkpoints?: Checkpoint[]) {
    return checkpoints?.filter((cp: Checkpoint) => Checkpoint.prototype
      .isOnline.call(cp, Timestamp.now()))
      .map((point: Checkpoint) => ({
        ...point,
        delta: geoDistance(point.coordinates?.latitude || 0,
          point.coordinates?.longitude || 0,
          center.latitude, center.longitude)
      } as Checkpoint))
      .filter((point: Checkpoint) => 1200 > (point.delta || Infinity));
  }

  /**
   * If the coordinates are set and not empty
   *
   * @param coordinates - LngLat object
   */
  validPoint(coordinates: LngLat) {
    return coordinates && coordinates.lat && coordinates.lng;
  }

  /**
   * Match the checkpoint list and the uid
   *
   * @param checkpoints - the checkpoint list
   * @param uid - the uid to find
   * @return either the uid or the first provided checkpoint's uid
   */
  validateSelection(checkpoints: Checkpoint[], uid?: string): string {
    return uid && checkpoints.find(cp => cp.uid === uid) ? uid : checkpoints[0].uid;
  }
}

/**
 * Generic geo distance calculation
 *
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 */

export const geoDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const R = 6371e3;
  return Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)) * R;
};
