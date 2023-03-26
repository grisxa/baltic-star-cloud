import {Buffer} from 'buffer';
import {StravaTokens} from './strava-tokens';
import {Timestamp} from 'firebase/firestore';
import {User, UserInfo} from 'firebase/auth';

export const NONE_RIDER = 'none';
const PUBLIC_FIELDS = [
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
const PRIVATE_FIELDS = [
  'owner',
  'uid',
  'admin',
  'alive',
  'providers',
  'strava',
  'stravaRevoke',
];

export interface UserWithProfile extends User {

  // optional collection of provider details
  profile?: ProviderDetails;
}

export type ExtraProviderInfo = {
  profile?: ProviderDetails;
  providers?: ProviderInfo[];
};

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

// copy of the UserInfo with possibly undefined properties
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
  alive: boolean;

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
  alive = false;

  code?: string;
  displayName?: string|null;
  firstName?: string;
  lastName?: string;
  birthDate?: Timestamp;
  city?: string;
  country?: string;

  // optional Strava connection
  strava?: StravaTokens;
  stravaRevoke?: boolean;

  constructor(owner: string, uid: string, displayName?: string|null) {
    this.owner = owner;
    this.uid = uid;

    [this.firstName, this.lastName] = Rider.splitName(displayName);
    this.updateDisplayName();

    // empty transparent pixel
    // this.image = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  }

  static splitName(displayName?: string|null) {
    // put fallbacks for first/last name
    displayName = displayName || '';
    const name = displayName.trim().split(/\s+/);
    const firstName = name.shift() || '?';
    const lastName = name.pop() || '?';
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

  copyProviders(providers?: ProviderInfo[], profile?: ProviderDetails): boolean {
    let needUpdate = false;
    for (const data of providers || []) {
      if (data?.providerId &&
        !this.providers.find((p: ProviderInfo) => p.providerId === data.providerId)) {
        this.providers.push(data);
        needUpdate = true;

        // special case of the Baltic star club
        this.overwriteBalticStar(data, profile);
      }
    }
    return needUpdate;
  }

  overwriteBalticStar(info?: ProviderInfo, profile?: ProviderDetails): Rider {
    if (info?.providerId === 'oidc.balticstar') {
      const [firstName, lastName] = Rider.splitName(info.displayName);
      Object.assign(this, {
        firstName, lastName,
        displayName: info.displayName,
        code: info.uid?.padStart(6, '0'),
      });

      if (profile) {
        const overwrite: RiderPublicDetails = Rider.copyProviderProfile(profile);
        Object.assign(this, overwrite);
      }
    }
    return this;
  }

  static fromDoc(doc: Rider) {
    // the first provider data goes to the 'providers' list below
    const providerInfo: ProviderInfo | undefined = doc.providers?.[0];
    // a name fallback for email-password registration
    const authInfo: ProviderInfo = Rider.copyProviderInfo(doc.auth);

    const rider = new Rider(doc.owner,
      doc.uid || doc.auth?.uid || providerInfo?.uid || '',
      doc.displayName || providerInfo?.displayName || authInfo.displayName || '');

    return Object.assign(rider, doc);
  }

  toPublicDoc(): RiderPublicDetails {
    const result = {} as RiderPublicDetails;
    PUBLIC_FIELDS.forEach(
      // @ts-ignore
      (key: string) => this[key] !== undefined ? result[key] = this[key] : null
    );
    return result;
  }

  toPrivateDoc(extra?: {[key: string]: any}): RiderPrivateDetails {
    const result = {} as RiderPrivateDetails;
    PRIVATE_FIELDS.forEach(
      // @ts-ignore
      (key: string) => this[key] !== undefined ? result[key] = this[key] : null
    );
    if (extra) {
      Object.assign(result, extra);
    }
    return result;
  }

  static equal(a?: Rider, b?: Rider): boolean {
    const keys = PUBLIC_FIELDS.concat(PRIVATE_FIELDS);

    const deepCompare = (x?: any, y?: any): boolean => !x && !y || !!x && !!y && JSON.stringify(Object.entries(x).sort()) === JSON.stringify(Object.entries(y).sort());

    // @ts-ignore
    return keys.every(key => !!a && !!b && (typeof(b[key]) === 'object' || a[key] === b[key]))
      && deepCompare(a?.strava, b?.strava)
      && !!a?.providers.every((info, i) => deepCompare(info, b?.providers[i]))
      && !!b?.providers.every((info, i) => deepCompare(info, a?.providers[i]))
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
    } catch (error: any) {
      console.error('Base64/JSON parsing error', error.message);
    }
    return info;
  }

  updateDisplayName() {
    this.displayName = `${this.firstName} ${this.lastName}`;
  }

  get hasCard(): boolean {
    return !!this.code;
  }
  get saved(): boolean {
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

export const mergeProviderInfo = (...lists: UserInfo[][]): UserInfo[] => {
  const infoList: UserInfo[] = lists.flat();
  type UserInfoSet = {[id: string]: UserInfo};

  const infoSet: UserInfoSet = infoList.reduce(
    (acc: UserInfoSet, info?: UserInfo) => {
      acc[info?.providerId || ''] = Object.assign(
        {} as ProviderInfo,
        acc[info?.providerId || ''] || {},
        Rider.copyProviderInfo(info)
      );
      return acc;
    },
    {} as UserInfoSet
  );
  return Object.values(infoSet).filter((info: UserInfo) => !!info);
};
