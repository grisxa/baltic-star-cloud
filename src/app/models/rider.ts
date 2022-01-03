import firebase from 'firebase/compat/app';
import {Buffer} from 'buffer';
import {StravaTokens} from './strava-tokens';
import Timestamp = firebase.firestore.Timestamp;
import User = firebase.User;
import UserInfo = firebase.UserInfo;

export const NONE_RIDER = 'none';

export interface UserWithProfile extends User {

  // optional collection of provider details
  profile?: ProviderDetails;
}

/* eslint @typescript-eslint/naming-convention: "warn" */
export type ProviderDetails = {
  code: string;
  name: string;
  email: string;
  given_name?: string;
  family_name?: string;
  birthDate: string;
  city: string;
  country: string;
  sub: string;
  id?: string;
};

export type ProviderInfo = {
  displayName?: string|null;
  email?: string|null;
  uid?: string;
  providerId?: string;
};

export type RiderPublicDetails = {
  // Google Auth unique user ID
  uid?: string;
  owner?: string;
  code?: string;
  displayName?: string|null;
  firstName?: string;
  lastName?: string;
  birthDate?: Timestamp;
  city?: string;
  country?: string;
  hidden?: boolean;
};

export type RiderPrivateDetails = {
  // Google Auth unique user ID
  uid?: string;
  owner?: string;
  admin: boolean;

  // linked OAuth accounts
  providers?: ProviderInfo[];

  // optional Strava connection
  strava?: StravaTokens;
};

export class Rider implements RiderPublicDetails, RiderPrivateDetails {
  // Google Auth unique user ID
  owner: string;
  auth: UserWithProfile | null = null;
  providers: ProviderInfo[] = [];
  uid: string;

  hidden = false;
  admin = false;

  code?: string;
  displayName?: string|null;
  firstName?: string;
  lastName?: string;
  birthDate?: Timestamp;
  city?: string;
  country?: string;

  // optional Strava connection
  strava?: StravaTokens;

  constructor(owner: string, uid: string, displayName?: string|null) {
    this.owner = owner;
    this.uid = uid;

    [this.firstName, this.lastName] = Rider.splitName(displayName);
    this.displayName = `${this.firstName} ${this.lastName}`;

    // empty transparent pixel
    // this.image = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  }

  static splitName(displayName?: string|null) {
    // put fallbacks for first/last name
    displayName = displayName || '';
    const name = displayName.split(/\s+/);
    const lastName = name.pop() || '?';
    const firstName = name.shift() || '?';
    return [firstName, lastName];
  }

  static copyProviderProfile(profile?: ProviderDetails): RiderPublicDetails {
    const draft: RiderPublicDetails = {
      city: profile?.city,
      country: profile?.country,
      displayName: profile?.name,
      firstName: profile?.given_name,
      lastName: profile?.family_name,
      code: profile?.sub?.padStart(6, '0'),
      birthDate: profile?.birthDate ? Timestamp.fromDate(new Date(profile.birthDate)) : undefined
    };
    return copyDefinedProperties(draft);
  };

  static copyProviderInfo(profile?: UserInfo|null): ProviderInfo {
    const draft: ProviderInfo = {
      email: profile?.email,
      displayName: profile?.displayName, // || profile?.name,
      uid: profile?.uid, // || profile?.id,
      providerId: profile?.providerId,
    };
    return copyDefinedProperties(draft);
  };

  static copyAdditionalInfo(profile?: ProviderDetails, providerId?: string): ProviderInfo {
    const draft: ProviderInfo = {
      email: profile?.email,
      displayName: profile?.name,
      uid: profile?.id || profile?.sub,
      providerId,
    };
    return copyDefinedProperties(draft);
  };

  static fromDoc(doc: Rider) {
    // the first provider data goes to the 'providers' list below
    const providerInfo: UserInfo | null | undefined = doc.auth?.providerData?.shift();

    const rider = new Rider(doc.owner,
      doc.uid || doc.auth?.uid || providerInfo?.uid || '',
      doc.displayName || providerInfo?.displayName || '');

    if (providerInfo?.providerId &&
      !rider.providers?.find(p => p.providerId === providerInfo?.providerId)) {
      rider.providers.push(Rider.copyProviderInfo(providerInfo));
    }

    const profile: RiderPublicDetails = Rider.copyProviderProfile(doc.auth?.profile);
    return Object.assign(rider, profile, doc);
  }

  toPublicDoc(): RiderPublicDetails {
    const fields = [
      'owner',
      'uid',
      'code',
      'displayName',
      'firstName',
      'lastName',
      'birthDate',
      'city',
      'country',
      'hidden',
    ];
    const result = {} as RiderPublicDetails;
    fields.forEach(
      // @ts-ignore
      (key: string) => this[key] !== undefined ? result[key] = this[key] : null
    );
    return result;
  }

  toPrivateDoc(extra?: {[key: string]: any}): RiderPrivateDetails {
    const fields = [
      'owner',
      'uid',
      'admin',
      'providers',
      'strava',
    ];
    const result = {} as RiderPrivateDetails;
    fields.forEach(
      // @ts-ignore
      (key: string) => this[key] !== undefined ? result[key] = this[key] : null
    );
    if (extra) {
      Object.assign(result, extra);
    }
    return result;
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
      return;
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

const copyDefinedProperties = (draft: RiderPublicDetails|ProviderInfo): RiderPublicDetails|ProviderInfo => {
  const result = {};
  Object.keys(draft).forEach(
    // @ts-ignore
    (key: string) => draft[key] !== undefined ? result[key] = draft[key] : null
  );
  return result;
};
