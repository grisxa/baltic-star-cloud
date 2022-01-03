import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {StravaTokens} from '../models/strava-tokens';
import {TrackNotFound} from '../models/track-not-found';
import {getFunctions, httpsCallable} from '@angular/fire/functions';

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
    const stravaToken = httpsCallable(getFunctions(), 'getStravaToken');
    return stravaToken({ code })
      .then((result) => {
        console.log('= function result', result);
        return result.data;
      });
  }

  refreshToken(tokens: StravaTokens) {
    const stravaToken = httpsCallable(getFunctions(),'refreshStravaToken');
    return stravaToken(tokens)
      .then((result) => {
        console.log('= function result', result);
        return result;
      });
  }

  searchActivities(brevetUid?: string, riderUid?: string) {
    const stravaSearch = httpsCallable(getFunctions(),'search_activities');
    return stravaSearch({brevetUid, riderUid})
      .then((result) => result.data)
      .then((data: any) => {
        if (data.error === 404) {
          throw new TrackNotFound(data.message);
        }
        return data.message;
      });
  }
}

export const tokenExpired = (tokens?: StravaTokens): boolean => (Date.now() / 1000) >= (tokens?.expires_at || 0);
