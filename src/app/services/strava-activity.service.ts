import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {StravaTokens} from '../models/strava-tokens';
import {TrackNotFound} from '../models/track-not-found';
import {getFunctions, httpsCallable} from '@angular/fire/functions';

const BASE_URL = 'https://www.strava.com/oauth';

@Injectable({
  providedIn: 'root'
})
export class StravaActivityService {
  private baseUrl = 'https://www.strava.com/oauth';
  constructor(private http: HttpClient) { }

  login(back: string) {
    const redirect = `${window.location.origin}/after-strava?back=${back}`;
    window.location.href = `${BASE_URL}/authorize?client_id=${environment.strava.clientId}` +
      `&response_type=code&redirect_uri=${redirect}` +
      `&approval_prompt=force&scope=activity:read`;
  }

  logout(token: string) {
    return this.http.post(`${BASE_URL}/deauthorize?access_token=${token}`, '').toPromise();
  }

  getToken(code: string): Promise<StravaTokens> {
    const stravaToken = httpsCallable(getFunctions(), 'getStravaToken');
    return stravaToken({ code })
      .then((result) => result.data as StravaTokens);
  }

  refreshToken(tokens?: StravaTokens): Promise<StravaTokens> {
    const stravaToken = httpsCallable(getFunctions(),'refreshStravaToken');
    return stravaToken(tokens)
      .then((result) => result.data as StravaTokens);
  }

  searchActivities(brevetUid?: string, riderUid?: string, tokens?: StravaTokens) {
    if (!brevetUid) {
      throw new TrackNotFound('Unknown brevet');
    }
    if (!riderUid) {
      throw new TrackNotFound('Unknown rider');
    }

    const stravaSearch = httpsCallable(getFunctions(),'stravaSearchActivities');
    return stravaSearch({brevetUid, riderUid, tokens})
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
