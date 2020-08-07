// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {firebase, firebaseui} from 'firebaseui-angular';

export const environment = {
  production: false,
  firebase: {
    apiKey: 'test',
    authDomain: 'baltic-star-cloud.web.app',
    databaseURL: 'https://baltic-star-cloud.firebaseio.com',
    projectId: 'baltic-star-cloud',
    storageBucket: 'baltic-star-cloud.appspot.com',
    messagingSenderId: '1',
    appId: 'test',
    measurementId: 'test'
  },
  auth: {
    signInFlow: 'redirect',
    signInOptions: [
      {
        scopes: [
          'profile', 'email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        customParameters: {
          // Forces account selection even when one account is available.
          prompt: 'select_account'
        }
      },
      {
        scopes: [
          'public_profile',
          'email'
        ],
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID
      },
      {
        requireDisplayName: true,
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
      }
    ],
    // tosUrl: '/tos',
    // privacyPolicyUrl: '/privacy',
    credentialHelper: firebaseui.auth.CredentialHelper.NONE
  } as firebaseui.auth.Config,
  mapbox: {
    accessToken: 'test'
  },
  router: {
    enableTracing: true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
