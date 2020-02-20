import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export class RiderCheckIn {
  uid: string;
  name: string;

  // Brevet info page, progress table
  time?: Timestamp[];

  // Checkpoint info page, rider table
  in?: Timestamp;
  out?: Timestamp;
}
