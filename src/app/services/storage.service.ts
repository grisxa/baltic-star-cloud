import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {Brevet} from '../models/brevet';
import {Checkpoint} from '../models/checkpoint';
import {Rider} from '../models/rider';
import {Barcode} from '../models/barcode';
import {catchError, filter, flatMap, map, mergeMap, switchMap, switchMapTo, tap} from 'rxjs/operators';
import {RiderCheckIn} from '../models/rider-check-in';
import {Signature} from '../models/signature';
import {of} from 'rxjs';
import * as firebase from 'firebase/app';
import * as geofirestore from 'geofirestore';

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

  getBrevet2(uid: string): AngularFirestoreDocument<Brevet> {
    console.log('= search brevet', uid);
    return this.firestore.collection('brevets').doc<Brevet>(uid || 'none');
  }
  getBrevet(uid: string) {
    console.log('= search brevet', uid);
    return this.firestore.collection('brevets').doc<Brevet>(uid || 'none')
      .valueChanges();
  }

  deleteBrevet(brevetUid: string): Promise<void> {
    return this.firestore
      .collection('brevets').doc(brevetUid).delete();
  }
  updateBrevet(brevet: Brevet) {
    return this.firestore.collection('brevets')
      .doc(brevet.uid).update(brevet);
  }

  createCheckpoint(brevet: Brevet, checkpoint: Checkpoint): Promise<string | void> {
    const {uid, name, length} = brevet;
    console.log('= create checkpoint', brevet, checkpoint);
    return this.firestore
      .collection('brevets').doc(brevet.uid)
      .collection('checkpoints').add({...checkpoint, brevet: {uid, name, length}})
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
      .collection('checkpoints').doc<Checkpoint>(checkpointUid || 'none')
      .valueChanges();
  }

  deleteCheckpoint(brevetUid: string, checkpointUid: string): Promise<void> {
    return this.firestore
      .collection('brevets').doc(brevetUid)
      .collection('checkpoints').doc(checkpointUid).delete();
  }
  updateCheckpoint(checkpoint: Checkpoint) {
    return this.geoCheckpoints.doc(checkpoint.uid)
      .update({...checkpoint, copy: false});
  }
  getBarcodeRoot(checkpointUid: string): AngularFirestoreDocument<Checkpoint> {
    console.log('= search checkpoint', checkpointUid);
    return this.firestore
      .collection('checkpoints').doc<Checkpoint>(checkpointUid || 'none');
  }

  createBarcode(root: 'checkpoints' | 'riders',
                controlUid: string,
                barcode: Barcode,
                authUid: string) {
    console.log('= save barcode', barcode);
    return this.firestore
      .collection(root).doc(controlUid)
      .collection('barcodes').add({
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
    return this.firestore.collection('riders').doc(rider.uid)
      .set({...rider}, {merge: true})
      .then(uid => {
        console.log('= document saved', rider.uid);
        return rider.uid;
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  getRider(uid: string) {
    console.log('= search rider', uid);
    return this.firestore.collection('riders').doc<Rider>(uid || 'none')
      .valueChanges();
  }

  deleteRider(uid: string): Promise<void> {
    return this.firestore.collection('riders').doc(uid).delete();
  }
  updateRider(rider: Rider) {
    return this.firestore.collection('riders')
      .doc(rider.uid).update(rider);
  }

  listBrevets() {
    return this.firestore.collection('brevets', ref => ref.orderBy('startDate')).get();
  }

  /*
  listCheckpoints(brevetUid: string) {
    return this.firestore
      .collection('brevets').doc(brevetUid)
      .collection('checkpoints', ref => ref.orderBy('distance'))
      .get();
  }
  */

  /*
  listRiders() {
    return this.firestore
      .collection('riders', ref => ref.where('hidden', '==', false).orderBy('lastName'))
      .get();
  }
  */

  watchRider(uid: string) {
    return this.firestore.collection('riders').doc(uid).valueChanges();
  }

  watchRiders() {
    return this.firestore
      .collection('riders', ref => ref.where('hidden', '==', false)
        .orderBy('lastName'))
      .valueChanges();
  }

  watchBarcodes(root: 'checkpoints' | 'riders', checkpointUid: string) {
    return this.firestore
      .collection(root).doc(checkpointUid)
      .collection('barcodes', ref => ref.orderBy('time', 'desc'))
      .valueChanges();
  }

  watchCheckpointProgress(brevetUid: string, checkpointUid: string) {
    return this.firestore
      .collection('checkpoints').doc(checkpointUid)
      .valueChanges().pipe(
        tap(data => console.log('checkpoint change', data)),
        // skip deleted checkpoints
        filter(Boolean),
        mergeMap((checkpoint: Checkpoint) => this.firestore
          .collection('brevets').doc(checkpoint.brevet.uid)
          .collection('checkpoints').doc(checkpoint.uid)
          .collection('riders')
          .valueChanges()
        ));
  }

  watchCheckpoints(brevetUid: string) {
    return this.firestore
      .collection('brevets').doc(brevetUid)
      .collection('checkpoints', ref => ref.orderBy('distance'))
      .valueChanges();
  }

  watchBrevetProgress(brevetUid: string) {
    return this.firestore
      .collection('brevets').doc(brevetUid)
      .collection('checkpoints', ref => ref.orderBy('distance'))
      .valueChanges().pipe(
        // tap(data => console.log('checkpoints change', data)),
        mergeMap((checkpoints: Checkpoint[]) => checkpoints),
        filter((checkpoint: Checkpoint) => !!checkpoint.uid),
        mergeMap((checkpoint: Checkpoint) => this.firestore
          .collection('brevets').doc(brevetUid)
          .collection('checkpoints').doc(checkpoint.uid)
          .collection('riders')
          .valueChanges().pipe(
            // tap(data => console.log('riders change', data)),
            map((riders: RiderCheckIn[]) => ({
                uid: checkpoint.uid,
                riders: riders.map(rider => ({
                  name: rider.name,
                  uid: rider.uid,
                  time: rider.time,
                } as RiderCheckIn))
              } as Checkpoint)
            )
          ),
        ));
  }
}
