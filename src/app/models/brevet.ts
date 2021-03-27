import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export const NONE_BREVET = 'none';

export class Brevet {
  uid: string;
  name: string;
  length: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  mapUrl?: string;

  constructor(uid: string, name: string, length: number, startDate: Timestamp) {
    this.uid = uid;
    this.name = name;
    this.length = length;
    this.startDate = startDate;
  }
}
