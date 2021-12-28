import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import firebase from 'firebase/app';
import 'firebase/functions';
import {StravaTokens} from '../models/strava-tokens';
import {TrackNotFound} from '../models/track-not-found';

@Injectable({
  providedIn: 'root'
})
export class StravaActivityService {
  private baseUrl = 'https://www.strava.com/oauth';
  constructor(private http: HttpClient) { }

  login(back: string) {
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${environment.strava.clientId}` +
      `&response_type=code&redirect_uri=${back}` +
      `&approval_prompt=force&scope=activity:read`;
  }

  getToken(code: string) {
    const stravaToken = firebase.functions().httpsCallable('getStravaToken');
    return stravaToken({ code })
      .then((result) => {
        console.log('= function result', result);
        return result.data;
      });
  }

  refreshToken(tokens: unknown) {
    const stravaToken = firebase.functions().httpsCallable('refreshStravaToken');
    return stravaToken(tokens)
      .then((result) => {
        console.log('= function result', result);
        return result;
      });
  }

  searchActivities(brevetUid?: string, riderUid?: string) {
    const stravaSearch = firebase.functions().httpsCallable('search_activities');
    return stravaSearch({brevetUid, riderUid})
      .then((result) => result.data)
      .then((data) => {
        if (data.error === 404) {
          throw new TrackNotFound(data.message);
        }
        return data.message;
      });
  }
}

export const tokenExpired = (tokens?: StravaTokens): boolean => (Date.now() / 1000) >= (tokens?.expires_at || 0);
