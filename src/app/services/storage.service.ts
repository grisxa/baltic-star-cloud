import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Brevet} from '../models/brevet';
import {Checkpoint, NONE_CHECKPOINT} from '../models/checkpoint';
import {Rider} from '../models/rider';
import {Barcode} from '../models/barcode';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {RiderCheckIn} from '../models/rider-check-in';
import firebase from 'firebase/app';
import * as geofirestore from 'geofirestore';
import {Observable} from 'rxjs';
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
      .then(uid => {
        console.log('= document saved', uid);
        return uid;
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  getBrevet(uid: string) {
    console.log('= search brevet', uid);
    return this.firestore
      .collection<Brevet>('brevets')
      .doc(uid)
      .valueChanges().pipe(
        filter(isNotNullOrUndefined)
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
      .update(brevet);
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
    console.log('= create checkpoint', brevet, checkpoint);
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
      .then(checkpointUid => {
        console.log('= document saved', checkpointUid);
        return this.geoCheckpoints.doc(checkpointUid).set({
          ...checkpoint,
          brevet: {uid, name, length}
        }).then(() => checkpointUid);
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  getCheckpoint(checkpointUid: string) {
    console.log('= search checkpoint', checkpointUid);
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
    console.log('= search checkpoint', checkpointUid);
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
    console.log('= save barcode', barcode);
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
    // avoid storing User auth (managed by firebase)
    const {auth, ...doc} = rider;
    const docPromise: Promise<void> = rider.uid ?
      this.firestore
        .collection<Rider>('riders')
        .doc(rider.uid)
        .set(doc as Rider, {merge: true}) :
      this.firestore
        .collection<Rider>('riders')
        .add(doc as Rider)
        .then(docRef => {
          doc.uid = docRef.id;
          return docRef.update(doc);
        });
    return docPromise
      .then(() => {
        console.log('= document saved', doc.uid);
        return doc.uid;
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  deleteRider(uid: string): Promise<void> {
    return this.firestore
      .collection<Rider>('riders')
      .doc(uid)
      .delete();
  }

  updateRider(rider: Rider) {
    // avoid storing User auth (managed by firebase)
    const {auth, ...doc} = rider;
    return this.firestore
      .collection<Rider>('riders')
      .doc(rider.uid)
      .update(doc);
  }

  watchRider(uid: string) {
    return this.firestore
      .collection<Rider>('riders')
      .doc(uid)
      .valueChanges().pipe(
        map((rider: Rider | undefined) => rider ? rider : {} as Rider)
      );
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
        tap(data => console.log('riders', data)),
        mergeMap(dictionary => this.firestore
          .collection<Checkpoint>('checkpoints')
          .doc(checkpointUid)
          .valueChanges().pipe(
            // tap(data => console.log('checkpoint change', data)),
            // skip deleted checkpoints
            filter(isNotNullOrUndefined),
            mergeMap((checkpoint: Checkpoint) => this.firestore
              .collection<Brevet>('brevets')
              .doc(checkpoint.brevet?.uid)
              .collection<Checkpoint>('checkpoints')
              .doc(checkpoint.uid)
              .collection<RiderCheckIn>('riders')
              .valueChanges().pipe(
                map((riders: RiderCheckIn[]) => riders
                  .map(rider => Object.assign(rider, {code: dictionary[rider.uid]}))
                )
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
        // tap(data => console.log('checkpoints change', data)),
        mergeMap((checkpoints: Checkpoint[]) => checkpoints),
        filter((checkpoint: Checkpoint) => !!checkpoint.uid),
        mergeMap((checkpoint: Checkpoint) => this.firestore
          .collection<Brevet>('brevets')
          .doc(brevetUid)
          .collection<Checkpoint>('checkpoints')
          .doc(checkpoint.uid)
          .collection<RiderCheckIn>('riders')
          .valueChanges().pipe(
            // tap(data => console.log('riders change', data)),
            map((riders: RiderCheckIn[]) => ({
                uid: checkpoint.uid,
                riders: riders.map(rider => ({
                  name: rider.name,
                  // TODO: rely on lastName presence (?) in the document
                  lastName: rider.lastName || rider.name?.split(/\s/).pop(),
                  uid: rider.uid,
                  time: rider.time,
                } as RiderCheckIn))
              } as Checkpoint)
            )
          ),
        ));
  }
}
