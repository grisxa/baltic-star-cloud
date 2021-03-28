import firebase from 'firebase/app';
import {Buffer} from 'buffer';
import Timestamp = firebase.firestore.Timestamp;
import User = firebase.User;

export const NONE_RIDER = 'none';

export class Rider {
  // Google Auth unique user ID
  owner: string;
  auth?: User;

  displayName: string;
  uid: string;
  code?: string;

  hidden = false;
  admin = false;

  firstName: string;
  lastName: string;
  birthDate?: Timestamp;
  city?: string;
  country?: string;

  constructor(owner: string, uid: string, displayName?: string) {
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
      doc.uid || doc.auth?.uid || '',
      doc.displayName || doc.auth?.displayName || '');
    return Object.assign(rider, doc);
  }

  updateInfo(encoded: string) {
    const info = this.decodeInfo(encoded);

    if (info) {
      const {firstName, lastName, birthDate, code, city, country} = info;

      this.firstName = firstName || this.firstName;
      this.lastName = lastName || this.lastName;
      this.code = code || this.code;
      this.city = city || this.city;
      this.country = country || this.country;
      this.birthDate = birthDate ? Timestamp.fromMillis(birthDate * 1000) : this.birthDate;
      this.updateDisplayName();
    }
  }

  decodeInfo(encoded: string) {
    let info;
    try {
      const bytes = Buffer.from(encoded, 'base64');
      info = JSON.parse(bytes.toString('utf-8'));
    } catch (error) {
      console.error('Base64/JSON parsing error', error.message);
    }
    return info;
  }

  updateDisplayName() {
    this.displayName = `${this.firstName} ${this.lastName}`;
  }

  get hasCard(): boolean {
    return !!this.owner;
  }
}
