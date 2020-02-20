import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export class Brevet {
  uid: string;
  name: string;
  length: number;
  startDate: Timestamp;

  constructor(uid: string, name: string, length: number, startDate: Timestamp) {
    this.uid = uid;
    this.name = name;
    this.length = length;
    this.startDate = startDate;
  }
}
