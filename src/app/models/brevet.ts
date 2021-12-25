import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import GeoPoint = firebase.firestore.GeoPoint;

export const NONE_BREVET = 'none';

export class Brevet {
  uid: string;
  name: string;
  length: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  mapUrl?: string;
  track?: {
    distance: number;
    coordinates: GeoPoint
  }[];

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
    return (!this.startDate || this.startDate.seconds <= time.seconds);
  }
}
