import {Injectable} from '@angular/core';
import {collectionData, docData, Firestore} from '@angular/fire/firestore';
import {Brevet} from '../models/brevet';
import {BrevetList} from '../models/brevet-list';
import {Checkpoint, NONE_CHECKPOINT} from '../models/checkpoint';
import {NONE_RIDER, Rider, RiderPrivateDetails, RiderPublicDetails} from '../models/rider';
import {Barcode} from '../models/barcode';
import {catchError, filter, map, mergeMap} from 'rxjs/operators';
import {RiderCheckIn} from '../models/rider-check-in';
import {combineLatest, from, Observable, of} from 'rxjs';
import {isNotNullOrUndefined} from '../utils';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  FirestoreDataConverter,
  GeoPoint,
  getDoc,
  getDocs,
  orderBy,
  PartialWithFieldValue,
  query,
  QueryDocumentSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  WithFieldValue
} from 'firebase/firestore';
import * as geofirestore from 'geofirestore';
// for geofirestore
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {environment} from '../../environments/environment';

const brevetConverter: FirestoreDataConverter<Brevet> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot) => Brevet.fromDoc(snapshot.data() as Brevet),
  toFirestore: (it: PartialWithFieldValue<Brevet>): DocumentData => ({...it}),
};
const brevetListConverter: FirestoreDataConverter<BrevetList> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot) => BrevetList.fromDoc(snapshot.data() as BrevetList),
  toFirestore: (it: PartialWithFieldValue<BrevetList>): DocumentData => ({...it}),
};
const checkpointConverter: FirestoreDataConverter<Checkpoint> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Checkpoint,
  toFirestore: (it: PartialWithFieldValue<Checkpoint>): DocumentData => ({...it}),
};
const barcodeConverter: FirestoreDataConverter<Barcode> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Barcode,
  toFirestore: (it: PartialWithFieldValue<Barcode>): DocumentData => ({...it}),
};
const riderPrivateConverter: FirestoreDataConverter<RiderPrivateDetails> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as RiderPrivateDetails,
  toFirestore: (it: PartialWithFieldValue<RiderPrivateDetails>): DocumentData => ({...it}),
};
const checkInConverter: FirestoreDataConverter<RiderCheckIn> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as RiderCheckIn,
  toFirestore: (it: PartialWithFieldValue<RiderCheckIn>): DocumentData => ({...it}),
};


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  geoCheckpoints: geofirestore.GeoCollectionReference;

  constructor(private firestore: Firestore) {
    /*
    firebase.firestore().clearPersistence().catch((error) => {
      console.error('Firestore cache cleaning error', error.code, error.message);
    });
     */
    // TODO: switch from the compatibility mode when the library update is available
    firebase.initializeApp(environment.firebase);
    this.geoCheckpoints = geofirestore
      // @ts-ignore
      .initializeApp(firebase.firestore())
      .collection('checkpoints');
  }

  listBrevets(): Promise<Brevet[]> {
    return getDoc<BrevetList>(doc(
      collection(this.firestore, 'brevets').withConverter<BrevetList>(brevetListConverter), 'list'))
      .then(snapshot => snapshot.data())
      .then(data => data?.brevets || [])
      .catch(error => {
        console.error('Error listing documents:', error);
        return [];
      });
  }

  createBrevet(brevet: Brevet): Promise<string> {
    return addDoc<Brevet>(
      collection(this.firestore, 'brevets')
        .withConverter<Brevet>(brevetConverter),
      {...brevet} as WithFieldValue<Brevet>)
      .then(docRef => {
        brevet.uid = docRef.id;
        return updateDoc(docRef, {uid: docRef.id})
          .then(() => docRef.id);
      })
      .catch(error => {
        console.error('Error adding document: ', error);
        return Promise.reject(error);
      });
  }

  getBrevet(uid: string): Promise<Brevet|undefined> {
    return getDoc<Brevet>(doc(
      collection(this.firestore, 'brevets')
        .withConverter<Brevet>(brevetConverter),
      uid))
      .then(snapshot => snapshot.data())
      .catch(error => {
        console.error('Error reading document: ', error);
        return Promise.reject(error);
      });
  }

  deleteBrevet(brevetUid: string): Promise<void> {
    return deleteDoc(doc(
      collection(this.firestore, 'brevets'),
      brevetUid))
      .catch(error => {
        console.error('Error deleting document: ', error);
        return Promise.reject(error);
      });
  }

  updateBrevet(brevet: Brevet): Promise<void> {
    return updateDoc<Brevet>(doc(
        collection(this.firestore, 'brevets')
          .withConverter<Brevet>(brevetConverter),
        brevet.uid),
      {...brevet} as WithFieldValue<Brevet>)
      .catch(error => {
        console.error('Error updating document: ', error);
        return Promise.reject(error);
      });
  }

  hasCheckpoint(brevetUid: string, checkpointUid: string): Promise<boolean> {
    return getDoc<Checkpoint>(doc(
        collection(doc(
          collection(this.firestore, 'brevets')
            .withConverter<Brevet>(brevetConverter),
          brevetUid), 'checkpoints')
          .withConverter<Checkpoint>(checkpointConverter),
        checkpointUid
      )
    ).then((snapshot) => !!snapshot.exists);
  }

  /**
   * Take a list of checkpoints and leave those are in the given brevet
   *
   * @param brevetUid The brevet UID
   * @param checkpoints The checkpoint list
   */
  filterCheckpoints(brevetUid: string, checkpoints: Checkpoint[]): Promise<Checkpoint[]> {
    return getDocs<Checkpoint>(query(
      collection(doc(
        collection(this.firestore, 'brevets'),
        brevetUid), 'checkpoints')
        .withConverter<Checkpoint>(checkpointConverter)))
      .then(snapshot => snapshot.docs.map(d => d.data()))
      .then((docs) => checkpoints.filter(cp => docs.map(data => data.uid).includes(cp.uid)));
  }

  /**
   * Locate checkpoints around using {@link geofirestore.GeoCollectionReference} index.
   * Search radius: 1.2 km.
   *
   * @param position
   */
  listCloseCheckpoints(position: GeolocationPosition): Promise<Checkpoint[]> {
    return this.geoCheckpoints
      .near({
        center: new GeoPoint(position.coords.latitude, position.coords.longitude),
        radius: 1.2
      }).get()
      .then(snapshot => snapshot.docs.map(d => d.data() as unknown as Checkpoint));
  }

  listCheckpoints(brevetUid: string): Promise<Checkpoint[]> {
    return getDocs<Checkpoint>(query(
      collection(this.firestore, 'checkpoints')
        .withConverter<Checkpoint>(checkpointConverter),
        where('brevet.uid', '==', brevetUid),
        orderBy('distance')))
      .then(snapshot => snapshot.docs.map(d => d.data()))
      .catch(error => {
        console.error('Error listing documents:', error);
        return [];
      });
  }

  createCheckpoint(brevet: Brevet, checkpoint: Checkpoint): Promise<string> {
    const {uid, name, length} = brevet;
    return addDoc<Checkpoint>(
      collection(doc(
        collection(this.firestore, 'brevets'),
        brevet.uid), 'checkpoints')
        .withConverter<Checkpoint>(checkpointConverter),
      {
        ...checkpoint,
        brevet: {uid, name, length}
      } as WithFieldValue<Checkpoint>)
      .then(docRef => {
        checkpoint.uid = docRef.id;
        return updateDoc(docRef, {uid: docRef.id})
          .then(() => docRef.id);
      })
      .then(checkpointUid => this.geoCheckpoints.doc(checkpointUid).set({
          ...checkpoint,
          brevet: {uid, name, length}
        }).then(() => checkpointUid)
      )
      /*
      .then(checkpointUid => setDoc<Checkpoint>(doc(
          collection(this.firestore, 'checkpoints')
            .withConverter<Checkpoint>(checkpointConverter),
          checkpointUid),
        {
          ...checkpoint,
          brevet: {uid, name, length}
        } as WithFieldValue<Checkpoint>)
        .then(() => checkpointUid)
      )
      */
      .catch(error => {
        console.error('Error adding document: ', error);
        return Promise.reject(error);
      });
  }

  getCheckpoint(checkpointUid: string): Promise<Checkpoint|undefined> {
    return getDoc<Checkpoint>(doc(
      collection(this.firestore, 'checkpoints')
        .withConverter<Checkpoint>(checkpointConverter),
        checkpointUid))
      .then(snapshot => snapshot.data())
      .catch(error => {
        console.error('Error reading document: ', error);
        return Promise.reject(error);
      });
  }

  deleteCheckpoint(brevetUid: string, checkpointUid: string): Promise<void> {
    return deleteDoc(doc(
      collection(doc(
          collection(this.firestore, 'brevets'), brevetUid),
        'checkpoints'), checkpointUid))
      .catch(error => {
        console.error('Error deleting document: ', error);
        return Promise.reject(error);
      });
  }

  updateCheckpoint(checkpoint: Checkpoint): Promise<void> {
    /*
    return updateDoc<Checkpoint>(doc(
        collection(this.firestore, 'checkpoints')
          .withConverter<Checkpoint>(checkpointConverter),
        checkpoint.uid),
      {...checkpoint, copy: false} as WithFieldValue<Checkpoint>)
      .catch(error => {
        console.error('Error updating document: ', error);
        return Promise.reject(error);
      });
    */
    return this.geoCheckpoints.doc(checkpoint.uid)
      .update({...checkpoint, copy: false})
      .catch((error: any) => {
        console.error('Error updating document: ', error);
        return Promise.reject(error);
      });
  }

  getBarcodeRoot(checkpointUid: string): Promise<Checkpoint|undefined> {
    return getDoc<Checkpoint>(doc(
      collection(this.firestore, 'checkpoints')
        .withConverter<Checkpoint>(checkpointConverter),
      checkpointUid))
      .then(snapshot => snapshot.data())
      .catch(error => {
        console.error('Error reading document: ', error);
        return Promise.reject(error);
      });
  }

  createBarcode(root: 'checkpoints' | 'riders',
                controlUid: string = NONE_CHECKPOINT,
                barcode: Barcode,
                authUid?: string): Promise<string> {
    if (!authUid) {
      return Promise.reject('No authentication string');
    }
    return addDoc<Barcode>(collection(doc(
      collection(this.firestore, root), controlUid),'barcodes')
      .withConverter<Barcode>(barcodeConverter),
      {
        ...barcode,
        control: controlUid,
        owner: authUid
      } as WithFieldValue<Barcode>)
      .then(docRef => {
        barcode.uid = docRef.id;
        return updateDoc(docRef, {uid: docRef.id})
          .then(() => docRef.id);
      })
      .catch(error => {
        console.error('Error adding document: ', error);
        return Promise.reject(error);
      });
  }

  createRider(rider: Rider): Promise<string> {
    const publicDetails: RiderPublicDetails = rider.toPublicDoc();

    let docPromise: Promise<void>;
    if (rider.uid) {
      docPromise = setDoc<RiderPublicDetails>(
        doc(collection(this.firestore, 'riders'), rider.uid),
        publicDetails as PartialWithFieldValue<RiderPublicDetails>,
        {merge: true});
    }
    else {
      docPromise = addDoc<RiderPublicDetails>(
        collection(this.firestore, 'riders'), publicDetails)
        .then(docRef => {
          publicDetails.uid = docRef.id;
          return updateDoc(docRef, {uid: docRef.id});
        });
    }
    return docPromise
      .then(() => setDoc<RiderPrivateDetails>(doc(
        collection(this.firestore, 'private')
          .withConverter<RiderPrivateDetails>(riderPrivateConverter),
          rider.uid),
          rider.toPrivateDoc({uid: publicDetails.uid}) as PartialWithFieldValue<RiderPrivateDetails>,
          {merge: true}))
      .then(() => publicDetails.uid || NONE_RIDER)
      .catch(error => {
        console.error('Error adding document: ', error);
        return Promise.reject(error);
      });
  }

  deleteRider(uid: string): Promise<void> {
    return deleteDoc(doc(
      collection(this.firestore, 'private'), uid))
      .then(() => deleteDoc(doc(
        collection(this.firestore, 'riders'), uid)))
      .catch(error => {
        console.error('Error deleting document: ', error);
      });
  }

  updateRider(rider?: Rider): Promise<void> {
    if (!rider) {
      return Promise.reject();
    }
    return updateDoc<RiderPublicDetails>(doc(
      collection(this.firestore, 'riders'),
        rider.uid), rider.toPublicDoc() as WithFieldValue<RiderPublicDetails>)
      .then(() => setDoc<RiderPrivateDetails>(doc(
          collection(this.firestore, 'private')
            .withConverter<RiderPrivateDetails>(riderPrivateConverter),
          rider.uid),
        rider.toPrivateDoc() as WithFieldValue<RiderPrivateDetails>,
        {merge: true}))
      .catch(error => {
        console.error('Error updating document: ', error);
        return Promise.reject(error);
      });
  }

  watchRider(uid?: string): Observable<Rider> {
    if (!uid) {
      return of({} as Rider);
    }
    const publicDetails$ = docData<RiderPublicDetails>(doc(
      collection(this.firestore, 'riders'), uid));
    const privateDetails$ = docData<RiderPrivateDetails>(doc(
      collection(this.firestore, 'private'), uid)
        .withConverter<RiderPrivateDetails>(riderPrivateConverter))
      // test for access error
      .pipe(catchError(error => of({} as Rider)));

    return combineLatest([publicDetails$, privateDetails$])
      .pipe(map(snapshots => Object.assign({} as Rider, snapshots[0], snapshots[1])));
  }

  getRider(uid?: string): Promise<Rider> {
    if (!uid) {
      return Promise.resolve({} as Rider);
    }
    const publicDetails$ = getDoc<RiderPublicDetails>(doc(
      collection(this.firestore, 'riders'), uid))
      .then((snapshot) => snapshot.data());
    const privateDetails$ = getDoc<RiderPrivateDetails>(doc(
      collection(this.firestore, 'private'), uid)
      .withConverter<RiderPrivateDetails>(riderPrivateConverter))
      .then((snapshot) => snapshot.data())
      // test for access error
      .catch((error) => {
        console.error('Private details failure', error);
        return {} as Rider;
      });
    return Promise.all([publicDetails$, privateDetails$])
      .then((details) => Object.assign({} as Rider, ...details));
  }

  /**
   * Track the rider list returning public info.
   * NOTE. Every document should have 'hidden' and 'lastName' fields.
   */
  watchRiders(): Observable<RiderPublicDetails[]> {
    return collectionData<RiderPublicDetails>(query(
      collection(this.firestore, 'riders'),
      where('hidden', '==', false),
      orderBy('lastName')));
  }

  watchBarcodes(root: 'checkpoints' | 'riders', checkpointUid: string): Observable<Barcode[]> {
    return collectionData<Barcode>(query(
      (collection(doc(
        collection(this.firestore, root),
        checkpointUid),'barcodes')
      .withConverter<Barcode>(barcodeConverter)),
      orderBy('time', 'desc')))
    .pipe(
        map((barcodes: Barcode[]) => barcodes
          .map((b: Barcode) => new Barcode(new Timestamp(b.time.seconds, b.time.nanoseconds),
            b.name || b.code, b.message)))
      );
  }

  watchCheckpointProgress(brevetUid: string, checkpointUid: string) {
    return from(getDocs<RiderPublicDetails>(query(
      collection(this.firestore, 'riders')))
      .then(snapshot => snapshot.docs.map(d => d.data())))
      .pipe(
        map((riders: RiderPublicDetails[]) => {
          // collect rider codes
          // TODO: save the code along with the barcode
          const dictionary: { [key: string]: string } = {};
          riders.forEach(rider => dictionary[rider.uid || ''] = rider.code || '');
          return dictionary;
        }),
        mergeMap((dictionary: { [key: string]: string }) => docData(doc(
          collection(this.firestore, 'checkpoints')
            .withConverter<Checkpoint>(checkpointConverter),
          checkpointUid))
          .pipe(
            // skip deleted checkpoints
            filter(isNotNullOrUndefined),
            mergeMap((checkpoint: Checkpoint) => collectionData<RiderCheckIn>(query(
              collection(doc(
                collection(doc(
                  collection(this.firestore, 'brevets'), checkpoint.brevet?.uid),
                  'checkpoints'), checkpoint.uid),
                'riders')
                .withConverter<RiderCheckIn>(checkInConverter)))
              .pipe(
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
                    // TODO: save the code along with the barcode
                    code: rider.code || dictionary[rider.uid],
                  } as RiderCheckIn;
                }))
              )
            ))));
  }

  watchCheckpoints(brevetUid: string): Observable<Checkpoint[]> {
    return collectionData<Checkpoint>(query(
      collection(doc(
          collection(this.firestore, 'brevets'), brevetUid),
        'checkpoints')
        .withConverter<Checkpoint>(checkpointConverter),
      orderBy('distance')));
  }

  watchBrevetProgress(brevetUid: string): Observable<Checkpoint> {
    return collectionData<Checkpoint>(query(
      collection(doc(
          collection(this.firestore, 'brevets'), brevetUid),
        'checkpoints')
        .withConverter<Checkpoint>(checkpointConverter),
      orderBy('distance')))
    .pipe(
        mergeMap((checkpoints: Checkpoint[]) => checkpoints),
        filter((checkpoint: Checkpoint) => !!checkpoint.uid),
        // TODO: extract similar code as above
        mergeMap((checkpoint: Checkpoint) => collectionData<RiderCheckIn>(query(
          collection(doc(
            collection(doc(
              collection(this.firestore, 'brevets'), brevetUid),
              'checkpoints'), checkpoint.uid),
            'riders')
            .withConverter<RiderCheckIn>(checkInConverter)))
          .pipe(
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
