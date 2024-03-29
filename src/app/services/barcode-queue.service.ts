import {Injectable} from '@angular/core';
import {StorageService} from './storage.service';
import {AuthService} from './auth.service';
import {Barcode} from '../models/barcode';
import {Offline} from '../models/offline';
import {SettingService} from './setting.service';
import {NONE_CHECKPOINT} from '../models/checkpoint';
import {Timestamp} from 'firebase/firestore';

type SavedBarcode = {
  source: 'riders' | 'checkpoints';
  sourceUid: string;
  barcode: Barcode;
  authUid: string;
};

// 12 days for timestamp comparison
const DOZEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 12;
const PREFIX = 'random_';

@Injectable({
  providedIn: 'root'
})
export class BarcodeQueueService {


  constructor(
    private auth: AuthService,
    private storage: StorageService,
    private settings: SettingService
  ) {
  }

  enqueueBarcode(source: 'riders' | 'checkpoints',
                 sourceUid: string = NONE_CHECKPOINT,
                 barcode: Barcode): Promise<string> {

    const tempUid = PREFIX + Math.random()
      .toString(36).substr(2, 9);

    this.settings.injectToken('barcodes', tempUid, {
      source, sourceUid, barcode,
      authUid: this.auth.user?.uid,
    });

    if (navigator.onLine) {
      this.repeatSending(tempUid);

      // the latest code
      return this.storage
        .createBarcode(source, sourceUid, barcode, this.auth.user?.uid)
        .then((uid: string) => this.settings.replaceToken('barcodes', tempUid, uid))
        .catch(error => {
          console.error('Barcode creation failure', error);
          return Promise.reject(error);
        });
    } else {
      return Promise.reject(new Offline('working offline'));
    }
  }

  // try sending old codes again
  repeatSending(skip?: string, force = false) {
    const savedCodes: { [key: string]: SavedBarcode } = this.settings.getValue('barcodes');

    // check all the records
    /* eslint guard-for-in: "warn" */
    for (const oldUid in savedCodes) {
      const savedCode = savedCodes[oldUid];

      // confirmed transmission doesn't have a temporary UID
      if (!oldUid.startsWith(PREFIX)) {
        // cleanup of old records out of interest
        if (savedCode.barcode.time.seconds < Date.now() / 1000 - DOZEN_DAYS_IN_SECONDS) {
          this.settings.removeToken('barcodes', oldUid);
        }
        if (!force) {
          continue;
        }
      }
      // the most recent code is being sent immediately
      if (oldUid === skip) {
        continue;
      }

      // restore Timestamp object from a JSON conversion
      const {seconds, nanoseconds} = savedCode.barcode.time;
      savedCode.barcode.time = new Timestamp(seconds, nanoseconds);

      this.storage
        .createBarcode(savedCode.source, savedCode.sourceUid, savedCode.barcode, savedCode.authUid)
        .then((uid) => this.settings.replaceToken('barcodes', oldUid, uid));
    }
  }

  listQueue() {
    const savedCodes: { [key: string]: SavedBarcode } = this.settings.getValue('barcodes') || {};

    return Object.keys(savedCodes)
      .sort((a, b) => savedCodes[b].barcode.time.seconds - savedCodes[a].barcode.time.seconds)
      .map(uid => ({
        time: new Timestamp(savedCodes[uid].barcode.time.seconds, savedCodes[uid].barcode.time.nanoseconds),
        code: savedCodes[uid].barcode.code,
        sent: !uid.startsWith(PREFIX)
      }));
  }
}
