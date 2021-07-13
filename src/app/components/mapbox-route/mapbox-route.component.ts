import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Checkpoint} from '../../models/checkpoint';
import * as mapboxGL from 'mapbox-gl';
import {Popup} from 'mapbox-gl';
import {environment} from '../../../environments/environment';
import firebase from 'firebase/app';
import LngLat = mapboxGL.LngLat;
import GeoPoint = firebase.firestore.GeoPoint;

const DEFAULT_CENTER = new LngLat(30.317, 59.95);

@Component({
  selector: 'app-mapbox-route',
  templateUrl: './mapbox-route.component.html',
  styleUrls: ['./mapbox-route.component.scss']
})
export class MapboxRouteComponent implements OnInit, OnDestroy {
  @Input() checkpoints?: Checkpoint[];
  map!: mapboxGL.Map;
  shownControlIndex = 0;
  stopJumping = false;

  constructor() {
  }

  ngOnInit(): void {
    // @ts-ignore
    mapboxGL.accessToken = environment.mapbox.accessToken;
    this.map = new mapboxGL.Map({
      container: 'mapbox',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 14,
    });
    this.map.addControl(new mapboxGL.NavigationControl());
    const startPoint = this.checkpoints && this.checkpoints.length > 0
      && this.checkpoints[0].coordinates
      || undefined;


    if (this.validCoordinates(startPoint)) {
      // @ts-ignore possibly undefined startPoint due to previous validCoordinates()
      this.map.setCenter({lng: startPoint.longitude, lat: startPoint.latitude});
    } else {
      this.map.setCenter(DEFAULT_CENTER);
    }

//    center: validPoint(this.data.center) ? this.data.center : DEFAULT_CENTER,

    this
      // skip broken coordinates
      .checkpoints?.filter(cp => this.validCoordinates(cp.coordinates))
      .forEach(cp => new Popup({
        // offset: 30,
        closeButton: false,
        closeOnClick: false,
        focusAfterOpen: false,
        anchor: 'bottom',
        className: 'popup',
      }).setHTML(cp.displayName || 'КП')
        // @ts-ignore possibly undefined coordinates due to previous validCoordinates()
        .setLngLat(new LngLat(cp.coordinates.longitude, cp.coordinates.latitude))
        .addTo(this.map));

    this.map.once('idle', this.shiftMap.bind(this));
  }

  shiftMap() {
    if (!this.stopJumping && this.checkpoints && this.checkpoints.length > 1) {
      const checkpoint = this.checkpoints[this.shownControlIndex++];
      this.map.flyTo({
        center: this.toLngLat(checkpoint?.coordinates),
      });
      if (this.shownControlIndex >= this.checkpoints.length) {
        this.shownControlIndex = 0;
      }
      this.map.once('idle', this.shiftMap.bind(this));
    }

  }
  ngOnDestroy() {
    this.stopJumping = true;
  }

  validLngLat(coordinates: LngLat) {
    return coordinates && coordinates.lat && coordinates.lng;
  }

  validCoordinates(coordinates?: GeoPoint) {
    return coordinates && coordinates.longitude && coordinates.latitude;
  }

  toLngLat(coordinates?: GeoPoint) {
    return new LngLat(coordinates?.longitude || DEFAULT_CENTER.lng,
      coordinates?.latitude || DEFAULT_CENTER.lat);
  }
}
