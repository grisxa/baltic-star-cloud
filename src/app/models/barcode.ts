import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import GeoPoint = firebase.firestore.GeoPoint;

export class Barcode {
  uid: string;
  time: Timestamp;
  code: string;
  message: string;

  constructor(time: Timestamp = Timestamp.now(),
              code: string = '', message: string = 'new') {
    this.time = time;
    this.code = code;
    this.message = message;
  }
}
