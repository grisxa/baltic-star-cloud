import {Brevet} from './brevet';
import {RiderCheckIn} from './rider-check-in';

export class Checkpoint {
  displayName: string;
  uid: string;
  distance?: number;
  copy?: boolean;

  // Checkpoint info page, brevet info
  brevet?: Brevet;

  // Checkpoint info page, rider table
  riders?: RiderCheckIn[];

  constructor(uid: string, name: string, distance: number) {
    this.uid = uid;
    this.displayName = name;
    this.distance = distance;
  }
}
