import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Brevet} from '../models/brevet';
import {Checkpoint, NONE_CHECKPOINT} from '../models/checkpoint';
import {Rider, RiderPrivateDetails, RiderPublicDetails} from '../models/rider';
import {Barcode} from '../models/barcode';
import {catchError, filter, map, mergeMap} from 'rxjs/operators';
import {RiderCheckIn} from '../models/rider-check-in';
import firebase from 'firebase/compat/app';
import * as geofirestore from 'geofirestore';
import {combineLatest, Observable, of} from 'rxjs';
import {isNotNullOrUndefined} from '../utils';
import GeoPoint = firebase.firestore.GeoPoint;
import QuerySnapshot = firebase.firestore.QuerySnapshot;
import Timestamp = firebase.firestore.Timestamp;


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  geoCheckpoints: geofirestore.GeoCollectionReference;

  constructor(private firestore: AngularFirestore) {
    /*
    firebase.firestore().clearPersistence().catch((error) => {
      console.error('Firestore cache cleaning error', error.code, error.message);
    });
     */
    this.geoCheckpoints = geofirestore
      .initializeApp(firebase.firestore())
      .collection('checkpoints');

  }


  listBrevets() {
    return this.firestore
      .collection<Brevet>('brevets', ref => ref.orderBy('startDate'))
      .get();
  }

  createBrevet(brevet: Brevet) {
    return this.firestore.collection('brevets').add({...brevet})
      .then(docRef => {
        brevet.uid = docRef.id;
        docRef.update({uid: docRef.id});
        return docRef.id;
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  getBrevet(uid: string) {
    return this.firestore
      .collection<Brevet>('brevets')
      .doc(uid)
      .valueChanges().pipe(
        filter(isNotNullOrUndefined),
        map(doc => Brevet.fromDoc(doc))
      );
  }

  deleteBrevet(brevetUid: string): Promise<void> {
    return this.firestore
      .collection<Brevet>('brevets')
      .doc(brevetUid)
      .delete();
  }

  updateBrevet(brevet: Brevet) {
    return this.firestore
      .collection<Brevet>('brevets')
      .doc(brevet.uid)
      .update({...brevet});
  }

  hasCheckpoint(brevetUid: string, checkpointUid: string) {
    return this.firestore
      .collection<Brevet>('brevets').doc(brevetUid)
      .collection<Checkpoint>('checkpoints').doc(checkpointUid)
      .get().toPromise()
      .then(doc => doc.exists);
  }

  /**
   * Take a list of checkpoints and leave those are in the given brevet
   *
   * @param brevetUid The brevet UID
   * @param checkpoints The checkpoint list
   */
  filterCheckpoints(brevetUid: string, checkpoints: Checkpoint[]) {
    return this.firestore
      .collection<Brevet>('brevets').doc(brevetUid)
      .collection<Checkpoint>('checkpoints').get()
      .pipe(
        map((snapshot: QuerySnapshot<Checkpoint>) => snapshot.docs),
        map(docs => checkpoints.filter(cp => docs.map(doc => doc.data().uid).includes(cp.uid)))
      );
  }

  /**
   * Locate checkpoints around using {@link geofirestore.GeoCollectionReference} index.
   * Search radius: 1.2 km.
   *
   * @param position
   */
  listCloseCheckpoints(position: GeolocationPosition) {
    return this.geoCheckpoints
      .near({
        center: new GeoPoint(position.coords.latitude, position.coords.longitude),
        radius: 1.2
      }).get();
  }

  listCheckpoints() {
    return this.firestore
      .collection<Checkpoint>('checkpoints')
      .get();
  }

  createCheckpoint(brevet: Brevet, checkpoint: Checkpoint): Promise<string | void> {
    const {uid, name, length} = brevet;
    return this.firestore
      .collection<Brevet>('brevets').doc(brevet.uid)
      .collection<Checkpoint>('checkpoints').add({
        ...checkpoint,
        brevet: {uid, name, length}
      } as Checkpoint)
      .then(docRef => {
        checkpoint.uid = docRef.id;
        docRef.update({uid: docRef.id});
        return docRef.id;
      })
      .then(checkpointUid => this.geoCheckpoints.doc(checkpointUid).set({
          ...checkpoint,
          brevet: {uid, name, length}
        }).then(() => checkpointUid)
      )
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  getCheckpoint(checkpointUid: string) {
    return this.firestore
      .collection<Checkpoint>('checkpoints')
      .doc(checkpointUid)
      .valueChanges().pipe(
        filter(isNotNullOrUndefined)
      );
  }

  deleteCheckpoint(brevetUid: string, checkpointUid: string): Promise<void> {
    return this.firestore
      .collection<Brevet>('brevets').doc(brevetUid)
      .collection<Checkpoint>('checkpoints')
      .doc(checkpointUid)
      .delete();
  }

  updateCheckpoint(checkpoint: Checkpoint) {
    return this.geoCheckpoints.doc(checkpoint.uid)
      .update({...checkpoint, copy: false});
  }

  getBarcodeRoot(checkpointUid: string): Observable<Checkpoint> {
    return this.firestore
      .collection<Checkpoint>('checkpoints')
      .doc(checkpointUid)
      .valueChanges().pipe(
        filter(isNotNullOrUndefined)
      );
  }

  createBarcode(root: 'checkpoints' | 'riders',
                controlUid: string = NONE_CHECKPOINT,
                barcode: Barcode,
                authUid?: string) {
    if (!authUid) {
      return Promise.reject('No authentication string');
    }
    return this.firestore
      .collection<Checkpoint | Rider>(root).doc(controlUid)
      .collection<Barcode>('barcodes').add({
        ...barcode,
        control: controlUid,
        owner: authUid
      })
      .then(docRef => {
        barcode.uid = docRef.id;
        docRef.update({uid: docRef.id});
        return docRef.id;
      });
  }

  createRider(rider: Rider) {
    const publicDetails = rider.toPublicDoc();

    let docPromise: Promise<void>;
    if (rider.uid) {
      docPromise = this.firestore
          .collection<RiderPublicDetails>('riders')
          .doc(rider.uid)
          .set(publicDetails, {merge: true});
    }
    else {
      docPromise = this.firestore
        .collection<RiderPublicDetails>('riders')
        .add(rider.toPublicDoc())
        .then(docRef => {
          publicDetails.uid = docRef.id;
          return docRef.update(publicDetails);
        });
    }
    return docPromise
      .then(() => this.firestore
        .collection<RiderPrivateDetails>('private')
        .doc(publicDetails.uid)
        .set(rider.toPrivateDoc({uid: publicDetails.uid}), {merge: true}))
      .then(() => publicDetails.uid)
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  deleteRider(uid: string): Promise<void> {
    return this.firestore
      .collection<RiderPrivateDetails>('private')
      .doc(uid)
      .delete()
      .then(() =>this.firestore
        .collection<RiderPublicDetails>('riders')
        .doc(uid)
        .delete()
      );
  }

  updateRider(rider?: Rider) {
    if (!rider) {
      return Promise.reject();
    }
    return this.firestore
      .collection<RiderPublicDetails>('riders')
      .doc(rider.uid)
      .update(rider.toPublicDoc())
      .then(() => this.firestore
        .collection<RiderPrivateDetails>('private')
        .doc(rider.uid)
        .update(rider.toPrivateDoc())
      );
  }

  watchRider(uid?: string): Observable<Rider|undefined> {
    if (!uid) {
      return of(undefined);
    }
    const publicDetails$ = this.firestore
      .collection<RiderPublicDetails>('riders')
      .doc(uid)
      .valueChanges();
    const privateDetails$ = this.firestore
      .collection<RiderPrivateDetails>('private')
      .doc(uid)
      .valueChanges()
      // test for access error
      .pipe(catchError(error => of(undefined)));

    return combineLatest([publicDetails$, privateDetails$])
      .pipe(map(snapshots => Object.assign({} as Rider, snapshots[0], snapshots[1])));
  }

  getRider(uid?: string): Observable<Rider|undefined> {
    if (!uid) {
      return of(undefined);
    }
    const publicDetails$ = this.firestore
      .collection<RiderPublicDetails>('riders')
      .doc(uid)
      .get()
      .pipe(map(snapshot => snapshot.data()));
    const privateDetails$ = this.firestore
      .collection<RiderPrivateDetails>('private')
      .doc(uid)
      .get()
      .pipe(
        map(snapshot => snapshot.data()),
        // test for access error
        catchError(error => of(undefined))
      );
    return combineLatest([publicDetails$, privateDetails$])
      .pipe(map(snapshots => Object.assign({} as Rider, snapshots[0], snapshots[1])));
  }

  watchRiders() {
    return this.firestore
      .collection<Rider>('riders',
        ref => ref.where('hidden', '==', false)
          .orderBy('lastName'))
      .valueChanges();
  }

  watchBarcodes(root: 'checkpoints' | 'riders', checkpointUid: string) {
    return this.firestore
      .collection<Checkpoint | Rider>(root)
      .doc(checkpointUid)
      .collection<Barcode>('barcodes',
        ref => ref.orderBy('time', 'desc'))
      .valueChanges().pipe(
        map((barcodes: Barcode[]) => barcodes
          .map((b: Barcode) => new Barcode(new Timestamp(b.time.seconds, b.time.nanoseconds),
            b.name || b.code, b.message)))
      );
  }

  watchCheckpointProgress(brevetUid: string, checkpointUid: string) {
    return this.firestore
      .collection<Rider>('riders')
      .get().pipe(
        map(snapshot => snapshot.docs),
        map(docs => docs.map(doc => doc.data())),
        map((riders: Rider[]) => {
          const dictionary: { [key: string]: string } = {};
          riders.forEach(rider => dictionary[rider.uid] = rider.code || '');
          return dictionary;
        }),
        mergeMap(dictionary => this.firestore
          .collection<Checkpoint>('checkpoints')
          .doc(checkpointUid)
          .valueChanges().pipe(
            // skip deleted checkpoints
            filter(isNotNullOrUndefined),
            mergeMap((checkpoint: Checkpoint) => this.firestore
              .collection<Brevet>('brevets')
              .doc(checkpoint.brevet?.uid)
              .collection<Checkpoint>('checkpoints')
              .doc(checkpoint.uid)
              .collection<RiderCheckIn>('riders')
              .valueChanges().pipe(
                map((riders: RiderCheckIn[]) => riders.map(rider => {
                  const names = rider.name?.trim().split(/\s/);
                  const lastName = rider.lastName || names.pop();
                  const firstName = rider.firstName || names.shift();
                  return {
                    ...rider,
                    // replace displayName
                    name: `${lastName} ${firstName}`,
                    // TODO: rely on lastName presence (?) in the document
                    lastName, firstName,
                    code: rider.code || dictionary[rider.uid],
                  } as RiderCheckIn;
                }))
              )
            ))));
  }

  watchCheckpoints(brevetUid: string) {
    return this.firestore
      .collection<Brevet>('brevets')
      .doc(brevetUid)
      .collection<Checkpoint>('checkpoints',
        ref => ref.orderBy('distance'))
      .valueChanges();
  }

  watchBrevetProgress(brevetUid: string) {
    return this.firestore
      .collection<Brevet>('brevets')
      .doc(brevetUid)
      .collection<Checkpoint>('checkpoints',
        ref => ref.orderBy('distance'))
      .valueChanges().pipe(
        mergeMap((checkpoints: Checkpoint[]) => checkpoints),
        filter((checkpoint: Checkpoint) => !!checkpoint.uid),
        mergeMap((checkpoint: Checkpoint) => this.firestore
          .collection<Brevet>('brevets')
          .doc(brevetUid)
          .collection<Checkpoint>('checkpoints')
          .doc(checkpoint.uid)
          .collection<RiderCheckIn>('riders')
          .valueChanges().pipe(
            map((riders: RiderCheckIn[]) => ({
                uid: checkpoint.uid,
                riders: riders.map(rider => {
                  const names = rider.name?.trim().split(/\s/);
                  const lastName = rider.lastName || names.pop();
                  const firstName = rider.firstName || names.shift();
                  return {
                    // replace displayName
                    name: `${lastName} ${firstName}`,
                    // TODO: rely on lastName presence (?) in the document
                    lastName, firstName,
                    uid: rider.uid,
                    code: rider.code,
                    time: rider.time,
                  } as RiderCheckIn;
                })
              } as Checkpoint)
            )
          )
        ));
  }
}
