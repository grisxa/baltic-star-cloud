import firebase from 'firebase/app';
import {Buffer} from 'buffer';
import Timestamp = firebase.firestore.Timestamp;
import User = firebase.User;

export const NONE_RIDER = 'none';

type ProviderDetails = {
  code: string;
  name: string;
  given_name?: string;
  family_name?: string;
  birthDate: string;
  city: string;
  country: string;
  sub: string;
};

class RiderDetails {
  code?: string;
  displayName!: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Timestamp;
  city?: string;
  country?: string;
}

export class Rider extends RiderDetails{
  // Google Auth unique user ID
  owner: string;
  auth?: User;
  uid: string;

  hidden = false;
  admin = false;

  // optional collection of provider details
  profile?: ProviderDetails;

  constructor(owner: string, uid: string, displayName?: string) {
    super();
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

  static copyProviderDetails(profile: ProviderDetails): RiderDetails {
    return profile ? {
      city: profile.city,
      country: profile.country,
      displayName: profile.name,
      firstName: profile.given_name,
      lastName: profile.family_name,
      code: profile.sub.padStart(6, '0'),
      birthDate: Timestamp.fromDate(new Date(profile.birthDate))
    } : {} as RiderDetails;
  };

  static fromDoc(doc: Rider) {
    const rider = new Rider(doc.owner,
      doc.uid || doc.auth?.uid || '',
      doc.displayName || doc.auth?.displayName || '');
    // @ts-ignore
    const profile = Rider.copyProviderDetails(doc.auth?.profile);
    return Object.assign(rider, profile, doc);
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

  decodeInfo(encoded?: string) {
    let info;
    if (!encoded) {
      return
    }
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
