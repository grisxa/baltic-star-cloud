import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export class Rider {
  // Google Auth unique user ID
  owner: string;

  displayName: string;
  uid: string;
  code: string;

  hidden = false;
  admin: boolean;

  firstName: string;
  lastName: string;
  birthDate: Timestamp;
  city: string;
  country: string;

  constructor(auth: string, uid: string, displayName: string) {
    this.owner = auth;
    this.uid = uid;

    // put fallbacks for first/last name
    displayName = displayName || '';
    const name = displayName.split(/\s+/);
    const lastName = name.pop() || '?';
    const firstName = name.shift() || '?';

    this.firstName = firstName;
    this.lastName = lastName;

    this.displayName = `${firstName} ${lastName}`;

    // empty transparent pixel
    // this.image = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  }
}
