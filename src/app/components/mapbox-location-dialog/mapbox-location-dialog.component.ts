import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as mapboxGL from 'mapbox-gl';
import {Popup} from 'mapbox-gl';
import {environment} from '../../../environments/environment';
import {Checkpoint} from '../../models/checkpoint';
import {StorageService} from '../../services/storage.service';
import {NONE_BREVET} from '../../models/brevet';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Timestamp} from 'firebase/firestore';
import {drawJsonRoute} from '../common';
import LngLat = mapboxGL.LngLat;

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

  private locationStarted = false;
  private selectedCheckpointUid?: string;
  private unsubscribe$ = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: MapboxLocationDialogSettings,
              private storage: StorageService) {
    this.checkpointControl = new FormControl({value: null, disabled: true},
      Validators.required);
  }

  ngOnInit(): void {
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
      }).setHTML(cp.displayName || 'КП')
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
    const {timestamp, coords} = event as GeolocationPosition;
    const quickResult: Checkpoint[] | undefined = this.quickSearch(coords, this.data.checkpoints);
    if (quickResult) {
      const checkpoints = quickResult.sort(
        (a: Checkpoint, b: Checkpoint) => (a.delta || 0) - (b.delta || 0));
      this.checkpointsAround = checkpoints;
      if (checkpoints.length) {
        this.checkpointControl.enable();
        this.checkpointControl.setValue(this.validateSelection(checkpoints, this.selectedCheckpointUid));
      } else {
        this.checkpointControl.disable();
        this.checkpointControl.setValue(null);
      }
    }

    this.storage.listCloseCheckpoints(event as GeolocationPosition)
      .then(docs => docs
        .map((doc): Checkpoint => Object.assign({} as Checkpoint,
          // add a distance
          doc, {delta: doc.distance})))
      // sort them by the distance, closest first
      .then(checkpoints => checkpoints.sort(
        (a: Checkpoint, b: Checkpoint) => (a.delta || 0) - (b.delta || 0)))
      // skip checkpoints not in the brevet
      .then(checkpoints => this.storage
        .filterCheckpoints(this.data.brevetUid || NONE_BREVET, checkpoints))
      // filter out checkpoints by brevet's date
      .then(checkpoints => checkpoints
        .filter((cp: Checkpoint) => Checkpoint.prototype.isOnline.call(cp, Timestamp.now())))
      .then(checkpoints => {
        this.checkpointsAround = checkpoints;
        if (checkpoints.length) {
          this.checkpointControl.enable();
          this.checkpointControl.setValue(this.validateSelection(checkpoints, this.selectedCheckpointUid));
        }
        else {
          this.checkpointControl.disable();
          this.checkpointControl.setValue(null);
        }
      });
  }

  // calculate a distance to the control points and compare
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

  validPoint(coordinates: LngLat) {
    return coordinates && coordinates.lat && coordinates.lng;
  }

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
