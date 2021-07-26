import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import firebase from 'firebase/app';
import 'firebase/functions';
import {StravaTokens} from '../models/strava-tokens';

@Injectable({
  providedIn: 'root'
})
export class StravaActivityService {
  private baseUrl = 'https://www.strava.com/oauth'
  constructor(private http: HttpClient) { }

  login(back: string) {
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${environment.strava.clientId}&response_type=code&redirect_uri=${back}&approval_prompt=force&scope=activity:read`;
  }

  getToken(code: string) {
    const stravaToken = firebase.functions().httpsCallable('getStravaToken');
    return stravaToken({ code })
      .then((result) => {
        console.log('= function result', result);
        return result;
      });
  }

  refreshToken() {
    const stravaToken = firebase.functions().httpsCallable('refreshStravaToken');
    return stravaToken()
      .then((result) => {
        console.log('= function result', result);
        return result;
      });
  }

  searchActivities(after?: number, before?: number) {
    console.log('= search', after, before);
    const stravaSearch = firebase.functions().httpsCallable('searchActivities');
    const stravaStreams = firebase.functions().httpsCallable('getStreams');
    return stravaSearch({after, before})
      .then((result) => result.data)
      .then((activities) => Promise.all(activities
        // @ts-ignore
        .map((activity: unknown[]) => stravaStreams({id: activity.id}))))
      .then((result) => {
        console.log('= function result', result);
        return result;
      })
  }
}

export const tokenExpired = (tokens: StravaTokens): boolean => {
  return (Date.now() / 1000) >= tokens.expires_at;
};
