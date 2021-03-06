import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Brevet} from '../../models/brevet';

import {StorageBackend} from '../../models/storage-backend';
import Timestamp = firebase.firestore.Timestamp;

const SUFFIX = '.beta';

interface BrevetDocument {
  uid: string;
  name: string;
  length: number;
  startDate: Timestamp;
  endDate?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class CloudFirestoreService implements StorageBackend {

  constructor(private firestore: AngularFirestore) {
  }

  /**
   * Connect to the back-end and return a list of brevets
   * (as an Observable).
   */
  listBrevets(): Observable<Brevet[]> {
    return this.firestore.doc(`/brevets${SUFFIX}/list`).get().pipe(
      // extract data from the snapshot
      map(document => document.data()),
      // collect a prepared list of brevets
      map(data => !!data && data.hasOwnProperty('brevets') ? data['brevets'] : []),
      // convert documents to objects
      map((docs: BrevetDocument[]) => docs.map(doc => new Brevet(doc.name, {
        ...doc,
        // convert Timestamp to Date
        startDate: doc.startDate.toDate(),
        endDate: doc.endDate?.toDate(),
      })))
    );
  }
}
