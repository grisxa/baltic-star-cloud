import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import firebase from 'firebase/app';
import * as mapboxgl from 'mapbox-gl';
import {environment} from '../../../environments/environment';
import {AuthService} from '../../services/auth.service';
import GeoPoint = firebase.firestore.GeoPoint;
import LngLat = mapboxgl.LngLat;


@Component({
  selector: 'app-mapbox-dialog',
  templateUrl: './mapbox-dialog.component.html',
  styleUrls: ['./mapbox-dialog.component.scss']
})
export class MapboxDialogComponent implements OnInit {
  formGroup: FormGroup;
  map: mapboxgl.Map;
  marker: mapboxgl.Marker;
  private defaultCenter = new GeoPoint(59.95, 30.317);

  constructor(@Inject(MAT_DIALOG_DATA) public data: GeoPoint, public auth: AuthService) {
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      latitude: new FormControl('', [Validators.required, Validators.pattern('[-0-9,.]+')]),
      longitude: new FormControl('', [Validators.required, Validators.pattern('[-0-9,.]+')])
    });

    if (!this.data || !this.data.latitude || !this.data.longitude) {
      this.data = this.defaultCenter;
    }

    this.formGroup.controls.latitude?.setValue(this.data.latitude);
    this.formGroup.controls.longitude?.setValue(this.data.longitude);
    this.formGroup.valueChanges
      .subscribe(position => this.marker.setLngLat([position.longitude, position.latitude]));

    const center = new LngLat(this.data.longitude, this.data.latitude);

    // @ts-ignore
    mapboxgl.accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container: 'mapbox',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 14,
      center
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    this.marker = new mapboxgl.Marker({draggable: this.auth.isAdmin})
      .setLngLat(center)
      .addTo(this.map)
      .on('dragend', this.onDragEnd);
  }

  onDragEnd() {
    const lngLat = this.marker.getLngLat();
    this.formGroup.controls.latitude?.setValue(lngLat.lat);
    this.formGroup.controls.longitude?.setValue(lngLat.lng);
  }
}
