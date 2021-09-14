import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {from, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export * from './checkpoint-print';
// import * as crypto from 'crypto';
import GeoPoint = admin.firestore.GeoPoint;
import Timestamp = admin.firestore.Timestamp;
import DocumentReference = admin.firestore.DocumentReference;
import DocumentData = admin.firestore.DocumentData;

// import secret from './secret';


admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
/*
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
*/

/*
function makeSignature(text: string) {
  return crypto.createHmac('sha256', secret)
    .update(text).digest('hex');
}

function checkSignature(controlUid: string, document: Barcode) {
  const hash = makeSignature(controlUid);

  // test checkpoint signature
  if (controlUid !== document.control || hash !== document.signature) {
    console.warn('signature check failed: ' +
      `control ${controlUid} / ${document.control} ; ` +
      `signature ${hash} / ${document.signature}`);
    return false;
  }
  return true;
}
*/

function injectRiderDoc(riderRef: DocumentReference<DocumentData>, barcode?: string) {
  return from(riderRef.get())
    .pipe(
      switchMap(doc => doc.exists ? of(doc.data() as Rider) :
        db.collection('riders')
          .where('code', '==', barcode)
          .limit(1).get()
          .then(snapshot => {
            if (snapshot.size === 0 || !snapshot.docs[0].exists) {
              throw new Error('rider not found');
            } else {
              return snapshot.docs[0].data() as Rider;
            }
          }))).toPromise();
}

function injectCheckpointDoc(checkpointRef: DocumentReference<DocumentData>) {
  return checkpointRef.get()
    .then(checkpointDoc => {
      if (checkpointDoc.exists) {
        return checkpointDoc.data() as Control;
      } else {
        throw new Error('checkpoint not found');
      }
    });
}

interface Barcode {
  uid: string;
  code: string;
  control: string;
  name: string;
  message: string;
  signature?: string;
  owner?: string;
  time: Timestamp;
  created?: Timestamp;
  copy?: boolean;
}

interface Brevet {
  uid: string;
  name: string;
}

interface Control {
  uid: string;
  displayName: string;
  distance?: number;
  brevet: Brevet;
  copy?: boolean;
  selfcheck?: boolean;
  sleep?: boolean;
  coordinates: GeoPoint;
}

interface Rider {
  uid: string;
  displayName: string;
}

function duplicateBarcode(barcodeObj: Barcode, control: Control | Rider, collection: 'checkpoints' | 'riders'): Promise<void> {
  if (barcodeObj.copy) {
    console.warn('avoid creating a barcode copying loop');
    return Promise.resolve()
  }

  const barcode = barcodeObj.code.trim();
  return db.doc(`${collection}/${barcode}`)
    .collection('barcodes').add({
      ...barcodeObj,
      code: control.uid,
      control: barcode,
      name: control.displayName,
      message: 'OK',
      copy: true,
      // signature: makeSignature(barcode)
    } as Barcode)
    .then(ref => ref.update({uid: ref.id})) as Promise<void>;
}

function updateRiderInfo(brevetUid: string, checkpointUid: string, riderUid: string,
                         name: string, time: Timestamp) {
  const ref = db.doc(`brevets/${brevetUid}/checkpoints/${checkpointUid}` +
    `/riders/${riderUid}`);
  return ref.get()
    .then(snapshot => snapshot.data() || {})
    .then(document => {
      const timestamps = document.time || [];
      // inject new time into the array and sort
      timestamps.push(time);
      timestamps.sort((a: Timestamp, b: Timestamp) => a.seconds - b.seconds);
      console.log('= new times', JSON.stringify(timestamps.map((t: Timestamp) => t.toDate().toString()).join(',')));
      return {
        ...document,
        name,
        uid: riderUid,
        // code: riderUid,
        time: timestamps
      };
    })
    .then(document => ref.set(document, {merge: true}));
}

function addCreated(barcodeObj: Barcode) {
  return {...barcodeObj, created: Timestamp.now()} as Barcode;
}

export const createCheckpointBarcode = functions.firestore.document('checkpoints/{checkpointUid}/barcodes/{documentUid}')
  .onCreate((snapshot, context) => {
    const {checkpointUid} = context.params;

    // extract code
    const barcodeObj: Barcode = addCreated(snapshot.data() as Barcode);
    const barcode: string = barcodeObj.code.trim();

    console.log('= new checkpoint code', checkpointUid, barcode, JSON.stringify(barcodeObj));

    /*
    // check signature
    if (!barcodeObj.owner && !checkSignature(checkpointUid, barcodeObj)) {
      return snapshot.ref.update({message: 'untrusted'});
    }
    */

    let riderName: string;
    let riderUid: string;

    return injectRiderDoc(db.doc(`riders/${barcode}`), barcode)
      .then(rider => snapshot.ref.update({
        ...barcodeObj,
        name: (riderName = rider.displayName),
        // save the rider UID
        uid: (riderUid = rider.uid),
        message: 'OK'
      }))
      .then(() => console.log(`record for rider ${barcode} updated`))
      .then(() => injectCheckpointDoc(db.doc(`checkpoints/${checkpointUid}`)))
      // FIXME: brevet uid undefined
      .then(checkpoint => updateRiderInfo(checkpoint.brevet.uid, checkpointUid,
        riderUid, riderName, barcodeObj.time)
        .then(() => duplicateBarcode({...barcodeObj, code: riderUid},
          checkpoint, 'riders'))
        .then(() => console.log('a copy for rider created'))
      )
      .then(() => console.log(`rider ${barcode} time updated`))
      .catch(e => {
        console.error(`barcode ${barcode} processing failed`, e.message);
        return snapshot.ref.update({message: 'error'});
      });
  });


export const createRiderBarcode = functions.firestore.document('riders/{riderUid}/barcodes/{documentUid}')
  .onCreate((snapshot, context) => {
    const {riderUid} = context.params;

    // extract code
    const barcodeObj: Barcode = addCreated(snapshot.data() as Barcode);
    const barcode: string = barcodeObj.code.trim();

    console.log('= new rider code', riderUid, barcode, JSON.stringify(barcodeObj));

    /*
    // check signature
    if (!barcodeObj.owner && !checkSignature(riderUid, barcodeObj)) {
      return snapshot.ref.update({message: 'untrusted'});
    }
    */

    return injectCheckpointDoc(db.doc(`checkpoints/${barcode}`))
      .then(checkpoint => snapshot.ref.update({
        ...barcodeObj,
        name: checkpoint.displayName,
        message: 'OK'
      }))
      .then(() => console.log(`record for checkpoint ${barcode} updated`))
      .then(() => injectRiderDoc(db.doc(`riders/${riderUid}`)))
      .then(rider => duplicateBarcode(barcodeObj, rider, 'checkpoints'))
      .then(() => console.log('a copy for checkpoint created'))
      .catch(e => {
        console.error(`barcode ${barcode} processing failed`, e.message);
        return snapshot.ref.update({message: 'error'});
      });
  });


export const updateBrevet = functions.firestore.document('brevets/{brevetUid}')
  .onUpdate((change, context) => {
    const {brevetUid} = context.params;

    console.log('= update brevet', brevetUid);

    return change.after.ref
      .collection('checkpoints').get()
      .then((snapshot) => snapshot.docs)
      //.then(checkpoints => checkpoints.map(cp => cp.data()))
      .then((checkpoints) => checkpoints.forEach(checkpointDoc => {
        const checkpoint = checkpointDoc.data();
        console.log(`update /brevets/ ${brevetUid} /checkpoints/ ${checkpoint.uid}`);
        return checkpointDoc.ref.set({
            brevet: change.after.data()
          }, {merge: true}
          // FIXME: wait for inner promises
        ).then(() => db.doc(`checkpoints/${checkpoint.uid}`).set({
            brevet: change.after.data()
          }, {merge: true}
          )
        ).then(() => console.log(`updated /checkpoints/ ${checkpoint.uid}`));
      }))
      .catch(e => {
        console.error(`brevet ${brevetUid} processing failed`, e.message);
      });
  });

export const updateBrevetCheckpoint = functions.firestore.document('brevets/{brevetUid}/checkpoints/{checkpointUid}')
  .onUpdate((change, context) => {
    const {brevetUid, checkpointUid} = context.params;
    const data: Control = change.after.data() as Control;

    if (data.copy) {
      console.warn('avoid creating a checkpoint copying loop');
      return Promise.resolve()
    }

    return db.doc(`checkpoints/${checkpointUid}`).set({
      displayName: data.displayName,
      distance: data.distance,
      coordinates: data.coordinates,
      selfcheck: data.selfcheck || false,
      sleep: data.sleep || false,
      copy: true
    }, {merge: true})
      .then(() => console.log(`updated /checkpoints/ ${checkpointUid}`))
      .catch(e => {
        console.error(`checkpoint ${brevetUid} ${checkpointUid} processing failed`, e.message);
      });
  });

export const updateCheckpoint = functions.firestore.document('checkpoints/{checkpointUid}')
  .onUpdate((change, context) => {
    const {checkpointUid} = context.params;
    const data: Control = change.after.data() as Control;

    if (data.copy) {
      console.warn('avoid creating a checkpoint copying loop');
      return Promise.resolve()
    }

    return db.doc(`brevets/${data.brevet.uid}/checkpoints/${checkpointUid}`).set({
      displayName: data.displayName,
      distance: data.distance,
      coordinates: data.coordinates,
      selfcheck: data.selfcheck || false,
      sleep: data.sleep || false,
      copy: true
    }, {merge: true})
      .then(() => console.log(`updated /checkpoints/ ${checkpointUid}`))
      .catch(e => {
        console.error(`checkpoint ${data.brevet.uid} ${checkpointUid} processing failed`, e.message);
      });
  });

export const deleteCheckpoint = functions.firestore.document('/brevets/{brevetUid}/checkpoints/{checkpointUid}')
  .onDelete((snapshot, context) => {
    const {checkpointUid} = context.params;
    return db.doc(`checkpoints/${checkpointUid}`).delete();
  });

/*
function updateSignature(snapshot: FirebaseFirestore.DocumentSnapshot,
                         context: functions.EventContext) {
  const {uid} = context.params;
  // sign uid to be able to check on arrival later
  const hash = crypto.createHmac('sha256', secret)
    .update(uid).digest('hex');
  console.log(`= document update ${uid}`);
  const data = snapshot.data() || {};
  // signature should be available to the owner only (and to an admin)
  if (data.signed) {
    return snapshot.ref.collection('private')
      .doc('signature').set({hash});
  } else {
    return snapshot.ref.collection('private')
      .doc('signature').delete();
  }
}

export const createRider = functions.firestore.document('/riders/{uid}')
  .onCreate(updateSignature);

export const createCheckpoint = functions.firestore.document('/checkpoints/{uid}')
  .onCreate(updateSignature);

export const createBrevetCheckpoint = functions.firestore.document('/brevets/{brevetUid}/checkpoints/{uid}')
  .onCreate(updateSignature);

// FIXME: update of /path/{uid} can't happen
export const updateRider = functions.firestore.document('/riders/{uid}')
  .onUpdate((change, context) =>
    updateSignature(change.after, context));

// TODO: hide this functions
export const updateCheckpointSignature = functions.firestore.document('/checkpoints/{uid}')
  .onUpdate((change, context) =>
    updateSignature(change.after, context));

export const updateBrevetCheckpoint = functions.firestore.document('/brevets/{brevetUid}/checkpoints/{uid}')
  .onUpdate((change, context) =>
    updateSignature(change.after, context));
*/


/*
export const checkpointWrite = functions.firestore.document('checkpoints/{uid}').onWrite((change, context) => {
  console.log('= cp write', context.params.uid, change.after.data());
  // TODO: decode token and take checkpoint uid
  return null;
});
*/
