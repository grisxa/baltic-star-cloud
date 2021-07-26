import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {AxiosResponse} from 'axios';

const axios = require('axios');
const TWO_HOURS = 60 * 60 * 2;

type StravaTokens = {
  access_token: string,
  // the athlete's profile, don't keep
  athlete?: any,
  // the only field to copy from the athlete's profile
  athlete_id?: number,
  expires_at: number,
  expires_in: number,
  refresh_token: string,
  token_type: string,
};

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const authBaseUrl = 'https://www.strava.com/oauth';
const apiBaseUrl = 'https://www.strava.com/api/v3';

export const getStravaToken = functions.https.onCall((data, context) => {
  const riderRef = db.doc(`riders/${context.auth?.uid}`);
  // firebase functions:config:get
  const config = functions.config();
  const body = {
    client_id: config.strava.client_id,
    client_secret: config.strava.client_secret,
    grant_type: 'authorization_code',
    code: data.code,
  };

  return axios.post(authBaseUrl + '/token', body)
    .then((reply: AxiosResponse) => reply.data)
    .then((reply: StravaTokens) => {
      reply.athlete_id = reply.athlete.id;
      delete reply.athlete;
      return reply;
    })
    .then((tokens: StravaTokens) => riderRef.update({strava: tokens}))
    .catch((error: Error) => {
      throw new functions.https.HttpsError('unauthenticated', error.message);
    });
});

export const refreshStravaToken = functions.https.onCall((data, context) => {
  const riderRef = db.doc(`riders/${context.auth?.uid}`);
  // firebase functions:config:get
  const config = functions.config();

  return riderRef.get()
    .then(snapshot => snapshot.data() || {})
    .then(document => {
      const body = {
        client_id: config.strava.client_id,
        client_secret: config.strava.client_secret,
        grant_type: 'refresh_token',
        refresh_token: document.strava.refresh_token,
      };
      return axios.post(authBaseUrl + '/token', body);
    })
    .then((reply: AxiosResponse) => reply.data)
    .then((tokens: StravaTokens) => riderRef.set({strava: tokens}, {merge: true}))
    .catch((error: Error) => {
      throw new functions.https.HttpsError('unauthenticated', error.message);
    });
});

export const searchActivities = functions.https.onCall((data, context) => {
  const riderRef = db.doc(`riders/${context.auth?.uid}`);

  return riderRef.get()
    .then(snapshot => snapshot.data() || {})
    .then(document => {
      const headers = {
        Authorization: `${document.strava.token_type} ${document.strava.access_token}`
      };
      const params: { after?: number, before?: number } = {};
      if (data.after) {
        params.after = data.after - TWO_HOURS;
      }
      if (data.before) {
        params.before = data.before + TWO_HOURS;
      }
      return axios.get(apiBaseUrl + '/athlete/activities', {headers, params});
    })
    .then((reply: AxiosResponse) => reply.data)
    .catch((error: Error) => {
      console.error(`= failure ${error.message}`);
      throw new functions.https.HttpsError('unavailable', error.message);
    });
});

export const getStreams = functions.https.onCall((data, context) => {
  const riderRef = db.doc(`riders/${context.auth?.uid}`);

  return riderRef.get()
    .then(snapshot => snapshot.data() || {})
    .then(document => {
      const headers = {
        Authorization: `${document.strava.token_type} ${document.strava.access_token}`
      };
      const params: { keys: string, key_by_type: boolean } = {
        keys: 'latlng,time',
        key_by_type: true,
      };
      return axios.get(apiBaseUrl + `/activities/${data.id}/streams`, {headers, params});
    })
    .then((reply: AxiosResponse) => reply.data)
    .catch((error: Error) => {
      console.error(`= failure ${error.message}`);
      throw new functions.https.HttpsError('unavailable', error.message);
    });
});

