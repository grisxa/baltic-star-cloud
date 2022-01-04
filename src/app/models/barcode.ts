import {Timestamp} from 'firebase/firestore';

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
