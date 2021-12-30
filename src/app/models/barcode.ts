import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;

export class Barcode {
  uid?: string;
  time: Timestamp;
  code: string;
  message: string;

  control?: string;
  owner?: string;

  // a meaningful control identifier
  name?: string;

  constructor(time: Timestamp = Timestamp.now(),
              code: string = '', message: string = 'new') {
    this.time = time;
    this.code = code;
    this.message = message;
  }
}
