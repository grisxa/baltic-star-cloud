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

/**
 * Compare checkpoints by the open time
 *
 * @param a - the first checkpoint
 * @param b - the second checkpoint
 * @param currentTime - the current time to compare to
 */
export const orderCheckpointsByTime = (a: Checkpoint, b: Checkpoint, currentTime: number): number => {
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

/**
 * Compare checkpoints by the delta (the distance to the current position) with 100 m precision
 *
 * @param a - the first checkpoint
 * @param b - the second checkpoint
 */
export const orderCheckpointsByDistance = (a: Checkpoint, b: Checkpoint): number =>
  Math.round((a.delta || 0) / 100) - Math.round((b.delta || 0) / 100);

export type CheckIns = { [key: string]: Timestamp[] };

/**
 * Compare checkpoints by the previous check-ins
 *
 * @param a - the first checkpoint
 * @param b - the second checkpoint
 * @param checkins - the history of check-ins
 */
export const orderCheckpointsByVisit = (a: Checkpoint, b: Checkpoint, checkins: CheckIns = {}): number => {
  if (a.uid in checkins && b.uid in checkins) {
    const aTimes = checkins[a.uid];
    const bTimes = checkins[b.uid];
    return bTimes[bTimes.length - 1].toMillis() - aTimes[aTimes.length - 1].toMillis();
  } else if (a.uid in checkins) {
    return 1;
  } else if (b.uid in checkins) {
    return -1;
  }
  return 0;
};
