import {Brevet} from './brevet';
import {RiderCheckIn} from './rider-check-in';
import {RoutePoint} from './route-point';
import * as firebase from 'firebase/app';

import GeoPoint = firebase.firestore.GeoPoint;
import Timestamp = firebase.firestore.Timestamp;

export class Checkpoint {
  displayName: string;
  uid: string;
  // to the start by track
  distance?: number;
  coordinates?: GeoPoint;
  // to the current position
  delta?: number;
  copy?: boolean;

  // Checkpoint info page, brevet info
  brevet?: Brevet;

  // Checkpoint info page, rider table
  riders?: RiderCheckIn[];

  constructor(routePoint: RoutePoint) {
    this.displayName = routePoint.name;
    this.distance = routePoint.distance;
    this.coordinates = new GeoPoint(routePoint.lat || 0, routePoint.lng || 0);
  }

  /**
   * Tests if the checkpoint is active based on a timestamp given.
   * A brevet the checkpoint is assigned to must have startDate-endDate range covering the timestamp.
   * @param time - current {@link Timestamp}
   */
  isOnline(time: Timestamp): boolean {
    console.log('=compare dates', this.brevet.startDate, time, this.brevet.endDate);
    return (!this.brevet.startDate || this.brevet.startDate <= time)
      && (!this.brevet.endDate || this.brevet.endDate >= time);
  }
}
