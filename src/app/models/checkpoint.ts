import {Brevet} from './brevet';
import {RiderCheckIn} from './rider-check-in';
import {RoutePoint} from './route-point';
import firebase from 'firebase/app';

import GeoPoint = firebase.firestore.GeoPoint;
import Timestamp = firebase.firestore.Timestamp;

// an hour in seconds
const HOUR = 3600;
export const NONE_CHECKPOINT = 'none';

export class Checkpoint {
  // TODO: switch to name
  displayName?: string;
  uid = NONE_CHECKPOINT;
  // to the start by track
  distance?: number;
  coordinates?: GeoPoint;
  // to the current position
  delta?: number;
  copy?: boolean;

  sleep?: boolean;
  selfcheck?: boolean;

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
   *
   * @param time - current {@link Timestamp}
   */

  isOnline(time: Timestamp): boolean {
    return (!this.brevet?.startDate || this.brevet.startDate.seconds - HOUR <= time.seconds)
      && (!this.brevet?.endDate || this.brevet.endDate.seconds + HOUR >= time.seconds);
  }
}
