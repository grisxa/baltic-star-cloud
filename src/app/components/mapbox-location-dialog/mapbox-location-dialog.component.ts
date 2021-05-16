import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as mapboxGL from 'mapbox-gl';
import {Popup} from 'mapbox-gl';
import {environment} from '../../../environments/environment';
import {Checkpoint} from '../../models/checkpoint';
import {StorageService} from '../../services/storage.service';
import {NONE_BREVET} from '../../models/brevet';
import firebase from 'firebase/app';
import {FormControl, Validators} from '@angular/forms';
import LngLat = mapboxGL.LngLat;
import Timestamp = firebase.firestore.Timestamp;

const DEFAULT_CENTER = new LngLat(30.317, 59.95);

type MapboxLocationDialogSettings = {
  center: LngLat;
  checkpoints: Checkpoint[];
  brevetUid: string;
};

@Component({
  selector: 'app-mapbox-dialog',
  templateUrl: './mapbox-location-dialog.component.html',
  styleUrls: ['./mapbox-location-dialog.component.scss']
})
export class MapboxLocationDialogComponent implements OnInit {
  map!: mapboxGL.Map;
  checkpointsAround?: Checkpoint[];
  checkpointControl: FormControl;

  private locationStarted = false;

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
      center: validPoint(this.data.center) ? this.data.center : DEFAULT_CENTER,
    });
    this.map.addControl(new mapboxGL.NavigationControl());
    console.log('checkpoints', this.data.checkpoints);

    this.data.checkpoints
      // skip broken coordinates
      .filter(cp => cp.coordinates?.longitude && cp.coordinates?.latitude)
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


    const geoLocate = new mapboxGL.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    this.map.addControl(geoLocate);
    geoLocate.on('geolocate', this.onLocationChanged.bind(this));
    geoLocate.on('trackuserlocationstart', () => {
      this.locationStarted = true;
    });

    // start location even if the map has failed to load
    this.map.on('error', () => {
      // but wait for 0.5 sec
      setTimeout(() => this.locationStarted || geoLocate.trigger(), 500);
    });

    this.map.on('load', () => this.locationStarted || geoLocate.trigger());
  }

  onLocationChanged(event: Object | undefined) {
    const {timestamp, coords} = event as GeolocationPosition;
//    console.log('A geolocate event has occurred.', new Date(timestamp), coords);
    this.storage.listCloseCheckpoints(event as GeolocationPosition)
      .then(snapshot => snapshot.docs
        .map((doc): Checkpoint => Object.assign({} as Checkpoint,
          doc.data(), {delta: doc.distance})))
      // sort them by the distance, closest first
      .then(checkpoints => checkpoints.sort(
        (a: Checkpoint, b: Checkpoint) => (a.delta || 0) - (b.delta || 0)))
      // skip checkpoints not in the brevet
      .then(checkpoints => this.storage
        .filterCheckpoints(this.data.brevetUid || NONE_BREVET, checkpoints).toPromise())
      // filter out checkpoints by brevet's date
      .then(checkpoints => checkpoints
        .filter((cp: Checkpoint) => Checkpoint.prototype.isOnline.call(cp, Timestamp.now())))
      .then(checkpoints => {
        this.checkpointsAround = checkpoints;
        if (checkpoints.length) {
          this.checkpointControl.enable();
          this.checkpointControl.setValue(checkpoints[0].uid);
        }
      });
  }
}

function validPoint(coordinates: LngLat) {
  return coordinates && coordinates.lat && coordinates.lng;
}
