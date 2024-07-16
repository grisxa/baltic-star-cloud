import {GeoPoint, Timestamp} from 'firebase/firestore';
import {Checkpoint} from "./checkpoint";

export const NONE_BREVET = 'none';

export class Brevet {
  uid: string;
  name: string;
  length: number;
  startDate: Timestamp;
  openDate?: Timestamp;
  endDate?: Timestamp;
  mapUrl?: string;
  track?: {
    distance: number;
    coordinates: GeoPoint;
  }[];
  checkpoints?: Checkpoint[];
  results?: {[key: string]: {[key: string]: any}};

  constructor(uid: string, name: string, length: number, startDate: Timestamp) {
    this.uid = uid;
    this.name = name;
    this.length = length;
    this.startDate = startDate;
  }

  static fromDoc(doc: Brevet) {
    const brevet = new Brevet(doc.uid, doc.name, doc.length, doc.startDate);
    return Object.assign(brevet, doc);
  }

  isStarted(): boolean {
    const time: Timestamp = Timestamp.now();
    // NOTE: openDate = startDate - 30 minutes or earlier
    const openDate = this.openDate || this.startDate;
    return (!openDate || openDate.seconds <= time.seconds);
  }

  isFinished(): boolean {
    const time: Timestamp = Timestamp.now();
    return (!this.endDate || this.endDate.seconds <= time.seconds);
  }
}
