import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import User = firebase.User;

export class Rider {
  // Google Auth unique user ID
  owner: string;
  auth?: User;

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

  constructor(owner: string, uid: string, displayName: string) {
    this.owner = owner;
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

  static fromDoc(doc: Rider) {
    const rider = new Rider(doc.owner,
      doc.uid || doc.auth.uid,
      doc.displayName || doc.auth.displayName);
    return Object.assign(rider, doc);
  }

  updateInfo(info) {
    if (info) {
      const {firstName, lastName, birthDate, code, city, country} = JSON.parse(info);

      this.firstName = firstName || this.firstName;
      this.lastName = lastName || this.lastName;
      this.code = code || this.code;
      this.city = city || this.city;
      this.country = country || this.country;
      this.birthDate = birthDate ? Timestamp.fromMillis(birthDate * 1000) : this.birthDate;
      this.updateDisplayName();
    }
  }

  updateDisplayName() {
    this.displayName = `${this.firstName} ${this.lastName}`;
  }

  get hasCard(): boolean {
    return !!this.owner;
  }
}
