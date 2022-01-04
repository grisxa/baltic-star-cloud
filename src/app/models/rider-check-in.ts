import {Timestamp} from 'firebase/firestore';

export interface RiderCheckIn {
  uid: string;
  code?: string;
  name: string;
  lastName?: string;
  firstName?: string;

  // Brevet info page, progress table
  time: Timestamp[];

  // Checkpoint info page, rider table
  in?: Timestamp;
  out?: Timestamp;
}
