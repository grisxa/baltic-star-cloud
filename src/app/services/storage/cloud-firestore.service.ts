import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import {merge, Observable, Subject} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {Brevet} from '../../models/brevet';
import {Checkpoint} from '../../models/checkpoint';

import {StorageBackend} from '../../models/storage-backend';
import {Waypoint} from '../../models/waypoint';
import Timestamp = firebase.firestore.Timestamp;

const SUFFIX = '.beta';

interface BrevetDocument {
  uid: string;
  name: string;
  length: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  checkpoints?: CheckpointDocument[];
}

interface CheckpointDocument {
  uid: string;
  name: string;
  distance: number;
}

export interface BrevetListDocument {
  brevets: BrevetDocument[];
}

@Injectable({
  providedIn: 'root'
})
export class CloudFirestoreService implements StorageBackend {

  constructor(private firestore: AngularFirestore) {
  }

  getBrevetListDocument(): Observable<BrevetListDocument> {
    return this.firestore.doc<BrevetListDocument>(`/brevets${SUFFIX}/list`).get().pipe(
      // extract data from the snapshot
      map(document => document.data())
    );
  }

  getBrevetDocument(uid: string = 'none'): Observable<Brevet> {
    return this.firestore.collection<Brevet>(`brevets${SUFFIX}`)
      .doc(uid).get().pipe(
        // extract data from the snapshot
        map(document => document.data())
      );
  }

  /**
   * Connect to the back-end and return a list of brevets
   * (as an Observable).
   */
  listBrevets(): Observable<Brevet[]> {
    return this.getBrevetListDocument().pipe(
      // collect a prepared list of brevets
      map(data => !!data && data.hasOwnProperty('brevets') ? data.brevets : []),
      // convert documents to objects
      map((docs: BrevetDocument[]) => docs.map(doc => new Brevet(doc.name, {
        ...doc,
        // convert Timestamp to Date
        startDate: doc.startDate.toDate(),
        endDate: doc.endDate?.toDate(),
        checkpoints: doc.checkpoints.map(checkpoint => new Checkpoint({
          name: checkpoint.name,
          distance: checkpoint.distance
        } as Waypoint)),
      })))
    );
  }

  getBrevet(uid: string = 'none'): Observable<Brevet> {
    const done$ = new Subject();
    return merge(
      this.listBrevets()
        .pipe(
          // skip the list if the main document has already arrived
          takeUntil(done$),
          // otherwise report short info from the brevet list
          map(brevets => brevets.find(item => item.uid === uid))),
      // stop watching once the document has been received
      this.getBrevetDocument(uid).pipe(tap(() => done$.next()))
    );
  }
}
