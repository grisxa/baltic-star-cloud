import {GeoPoint, Timestamp} from 'firebase/firestore';
import {Checkpoint} from "./checkpoint";

export const NONE_BREVET = 'none';
// an hour in seconds
const HOUR = 3600;

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

  hasStarted(): boolean {
    /**
     * The brevet starts after the openDate or startDate
     */
    const time: Timestamp = Timestamp.now();
    // NOTE: openDate = startDate - 30 minutes or earlier
    const openDate = this.openDate || this.startDate;
    return (!openDate || openDate.seconds <= time.seconds);
  }

  hasFinished(): boolean {
    /**
     * The brevet ends on the endDate
     */
    const time: Timestamp = Timestamp.now();
    return (!this.endDate || this.endDate.seconds <= time.seconds);
  }

  isOnline(time: Timestamp): boolean {
    /**
     * Turn on online tracking features [1 hour before ... 1 hour after] the brevet
     */
    return (!this.startDate || this.startDate.seconds - HOUR <= time.seconds)
      && (!this.endDate || this.endDate.seconds + HOUR >= time.seconds);
  }

  hasCheckpoints(): boolean {
    /**
     * Check if the checkpoints have been defined
     */
    return !!this.checkpoints?.length
  }
}
