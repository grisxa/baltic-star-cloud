import {Brevet} from './brevet';
import {RiderCheckIn} from './rider-check-in';
import {RoutePoint} from './route-point';

import {GeoPoint, Timestamp} from 'firebase/firestore';

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

  // Checkpoint open time
  startDate?: Timestamp;
  endDate?: Timestamp;

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

export const orderCheckpointsByTyme = (a: Checkpoint, b: Checkpoint, currentTime: number): number => {
  const aStart: number = a.startDate ? a.startDate.toMillis() : -Infinity;
  const bStart: number = b.startDate ? b.startDate.toMillis() : -Infinity;
  const aEnd: number = a.endDate ? a.endDate.toMillis() : Infinity;
  const bEnd: number = b.endDate ? b.endDate.toMillis() : Infinity;

  // consider the checkpoint is open by default
  const aOpen: boolean = aStart <= currentTime && currentTime <= aEnd;
  const bOpen: boolean = bStart <= currentTime && currentTime <= bEnd;

  if (aOpen && !bOpen) {
    return -1;
  } else if (!aOpen && bOpen) {
    return 1;
  } else if (aOpen && bOpen) {
    return aStart === bStart ? aEnd === bEnd ? 0 : aEnd - bEnd : aStart - bStart;
  } else {
    return 0;
  }
};

export const orderCheckpointsByDistance = (a: Checkpoint, b: Checkpoint): number => (a.delta || 0) - (b.delta || 0);
