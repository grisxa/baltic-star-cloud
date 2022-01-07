import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {AxiosResponse} from 'axios';

const axios = require('axios');

/* eslint @typescript-eslint/naming-convention: "warn" */
type StravaTokens = {
  access_token: string;
  // the athlete's profile, don't keep
  athlete?: any;
  // the only field to copy from the athlete's profile
  athlete_id?: number;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const authBaseUrl = 'https://www.strava.com/oauth';

export const getStravaToken = functions.https.onCall((data, context) => {
  const riderRef = db.doc(`private/${context.auth?.uid}`);
  // firebase functions:config:get
  const config = functions.config();
  const body = {
    client_id: config.strava.client_id,
    client_secret: config.strava.client_secret,
    grant_type: 'authorization_code',
    code: data.code,
  };

  return axios.post(authBaseUrl + '/token', body)
    .then((reply: AxiosResponse) => reply.data as StravaTokens)
    .then((reply: StravaTokens) => {
      reply.athlete_id = reply.athlete.id;
      delete reply.athlete;
      return reply;
    })
    .then((tokens: StravaTokens) => riderRef.get()
      .then(snapshot => snapshot.data())
      // don't keep the tokens after a revoke
      .then((rider: any) => rider.stravaRevoke ? tokens : riderRef.update({strava: tokens})
        .then(() => tokens)))
    .catch((error: Error) => {
      throw new functions.https.HttpsError('unauthenticated', error.message);
    });
});

export const refreshStravaToken = functions.https.onCall((data, context) => {
  const riderRef = db.doc(`private/${context.auth?.uid}`);
  // firebase functions:config:get
  const config = functions.config();

  return riderRef.get()
    .then(snapshot => snapshot.data() || {})
    .then((rider: any) => {
      const body = {
        client_id: config.strava.client_id,
        client_secret: config.strava.client_secret,
        grant_type: 'refresh_token',
        refresh_token: data.tokens?.refresh_token || rider.strava?.refresh_token,
      };
      return axios.post(authBaseUrl + '/token', body)
        .then((reply: AxiosResponse) => reply.data as StravaTokens)
        .then((reply: StravaTokens) => {
          reply.athlete_id = data.tokens?.athlete_id || rider.strava?.athlete_id;
          return reply;
        })
        // don't keep the tokens after a revoke
        .then((tokens: StravaTokens) => rider.stravaRevoke ? tokens : riderRef.update({strava: tokens})
          .then(() => tokens));
    })
    .catch((error: Error) => {
      throw new functions.https.HttpsError('unauthenticated', error.message);
    });
});
