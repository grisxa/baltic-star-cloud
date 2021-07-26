import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Timestamp = admin.firestore.Timestamp;

interface Rider {
  uid: string;
  name: string;
  code: string;
  time: Timestamp[];
}

interface CheckIn {
  uid: string;
  name: string;
  code?: string;
}

export const jsonExport2 = functions.https.onRequest((request, response) => {
  console.log('= serialize', JSON.stringify(request.path));
  return admin.firestore().doc(request.path).get()
    .then(doc => JSON.stringify(doc.data()))
    // .then(data => console.log(`= json ${data}`))
    .then(data => {
      response.status(200).send(data);
    })
    .catch(e => {
      console.error(`JSON serialization of document ${request.path} failed`, e.message);
    });
});

export const jsonExport = functions.https.onRequest((request, response) => {
  const search = request.path.match(/brevet\/([^/]+)/) || [];
  const [brevetUid] = search.slice(1);
  if (!brevetUid) {
    console.error('UID search failed', search);
    return Promise.reject();
  }
  let counter = 0;
  return admin.firestore()
    .collection('brevets').doc(brevetUid)
    .collection('checkpoints')
    .listDocuments()
    .then(controlRefs => Promise.all(controlRefs.map(controlRef => {
      const code = `cp${counter++}`;
      controlRef.collection('riders').get()
        .then(riderRefs => riderRefs.docs)
        .then(riderDocs => riderDocs.map(ref => ref.data() as Rider))
        .then(riders => riders.map(rider => {
          const checkIn: CheckIn = {
            uid: rider.uid,
            name: rider.name
          };
          if (rider.time) {
            // @ts-ignore
            checkIn[code] = rider.time[0];
          }
          if (rider.code) {
            checkIn['code'] = rider.code;
          }
          return checkIn;
        }))
        .catch(e => {
          console.error('Rider processing error', e.message);
        });
    })))
    .then(riders => JSON.stringify(riders))
    .then(data => {
      response.status(200).send(data);
    })
    .catch(e => {
      console.error(`JSON serialization of brevet ${brevetUid} failed`, e.message);
    });
});
