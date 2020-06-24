import {Component, OnInit} from '@angular/core';
import {GeoFirestore} from 'geofirestore';
import * as firebase from 'firebase/app';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  ngOnInit() {
    const firestore = firebase.initializeApp(environment.firebase);
    const geoFire = new GeoFirestore(firebase.firestore());
    geoFire.collection('checkpoints');
  }
}
