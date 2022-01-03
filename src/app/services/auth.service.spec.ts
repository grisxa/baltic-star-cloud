import {TestBed, waitForAsync} from '@angular/core/testing';

import {AuthService} from './auth.service';
import {StorageService} from './storage.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import firebase from 'firebase/compat/app';
import {environment} from '../../environments/environment.test';
import {SettingService} from './setting.service';
import {ProviderDetails, ProviderInfo, Rider} from '../models/rider';
import User = firebase.User;


class MockStorageService {
}

class MockSettingService {
  store: { [key: string]: string|undefined } = {};
  getValue = (key: string) => this.store[key] === 'undefined' ? undefined : JSON.parse(this.store[key] || 'null');
  setValue = (key: string, value: string) => this.store[key] = JSON.stringify(value);
  removeKey = (key: string) => delete this.store[key];
}

describe('AuthService', () => {
  let auth;
  let service: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        {provide: StorageService, useClass: MockStorageService},
        {provide: SettingService, useClass: MockSettingService},
      ],
      declarations: []
    }).compileComponents();

    firebase.initializeApp(environment.firebase);
    auth = firebase.auth();
    auth.useEmulator("http://localhost:9099");
  }));

  beforeEach(() => {
    service = TestBed.inject(AuthService);
    spyOn(service.settings, 'setValue');
    spyOn(service.settings, 'removeKey');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect((service.settings as unknown as MockSettingService).store).toEqual({'user': undefined});
  });

  describe('isLoggedIn', () => {
    it('should ignore undefined', () => {
      service.user = undefined;
      expect(service.isLoggedIn).toBeFalsy();
    });

    it('should accept a user', () => {
      service.user = new Rider('a1', 'b2');
      expect(service.isLoggedIn).toBeTruthy();
    });
  });

  describe('setCurrentUser', () => {
    it('should reset the current user', () => {
      service.setCurrentUser(undefined);
      expect(service.user).not.toBeDefined();
      expect(service.settings.setValue).toHaveBeenCalledOnceWith('user', undefined);
    });

    it('should update the current user', () => {
      const user = new Rider('a1', 'b2');
      service.setCurrentUser(user);
      expect(service.user).toEqual(user);
      expect(service.settings.setValue).toHaveBeenCalledOnceWith('user', user);
    });
  });

  describe('isAdmin', () => {
    it('should ignore undefined', () => {
      service.user = undefined;
      expect(service.isAdmin).toBeFalsy();
    });

    it('should ignore regular user', () => {
      service.user = new Rider('a1', 'b2');
      expect(service.isAdmin).toBeFalsy();
    });

    it('should accept admin flag', () => {
      service.user = new Rider('a1', 'b2');
      service.user.admin = true;
      expect(service.isAdmin).toBeTruthy();
    });
  });

  describe('hasProvider', () => {
    it('should ignore undefined', () => {
      service.user = undefined;
      expect(service.hasProvider('any')).toBeFalsy();
    });

    it('should ignore empty list', () => {
      service.user = new Rider('a1', 'b2');
      expect(service.hasProvider('any')).toBeFalsy();
    });

    it('should ignore missing provider', () => {
      service.user = new Rider('a1', 'b2');
      service.user.providers = [{providerId: "first"}];
      expect(service.hasProvider('second')).toBeFalsy();
    });

    it('should report matching provider', () => {
      service.user = new Rider('a1', 'b2');
      service.user.providers = [{providerId: "first"}, {providerId: "second"}];
      expect(service.hasProvider('second')).toBeTruthy();
    });
  });

  it('should reset the current user', () => {
    service.user = new Rider('a1', 'b2');
    spyOn(service.state$, 'signOut').and.callFake(() => Promise.resolve());

    service.logout();

    expect(service.settings.removeKey).toHaveBeenCalledOnceWith('user');
    expect(service.user).not.toBeDefined();
    expect(service.settings.removeKey).toHaveBeenCalled();
    expect(service.state$.signOut).toHaveBeenCalled();
  });

  describe('copyProviders', () => {
    const dummy = new Rider('c3', 'd4');

    beforeEach(() => {
      spyOn(service, 'overwriteBalticStar').and.returnValue(dummy);
    });

    it('should ignore empty list', () => {
      const rider = new Rider('a1', 'b2');
      const user = {providerData: []} as unknown as User;

      service.copyProviders(rider, user);

      expect(rider.providers).toEqual([]);
      expect(service.overwriteBalticStar).not.toHaveBeenCalled();
    });

    it('should add missing provider', () => {
      const rider = new Rider('a1', 'b2');
      const user = { providerData: [{providerId: "any"}]} as User;

      service.copyProviders(rider, user);

      expect(rider.providers).toEqual([{
        providerId: "any"
      }]);
      expect(service.overwriteBalticStar).toHaveBeenCalledOnceWith(rider, {providerId: "any"}, undefined);
    });

    it('should skip existing provider', () => {
      const rider = new Rider('a1', 'b2');
      rider.providers = [{providerId: "any"}];
      const user = { providerData: [{providerId: "any"}]} as User;

      service.copyProviders(rider, user);

      expect(rider.providers).toEqual([{
        providerId: "any"
      }]);
      expect(service.overwriteBalticStar).not.toHaveBeenCalled();
    });
  });

  describe('overwriteBalticStar', () => {
    it('should pass empty', () => {
      expect(service.overwriteBalticStar({} as Rider)).toEqual({} as Rider);
    });

    it('should keep info unchanged', () => {
      const rider = new Rider('a1', 'b2');

      expect(service.overwriteBalticStar(rider)).toEqual(rider);
    });

    it('should ignore other providers', () => {
      const rider = new Rider('a1', 'b2');
      const info = {providerId: "any"}

      expect(service.overwriteBalticStar(rider, info)).toEqual(rider);
    });

    it('should copy name', () => {
      const rider = new Rider('a1', 'b2');
      const info = {providerId: "oidc.balticstar", displayName: "John Doe"}
      const expected = Rider.fromDoc({
        owner: 'a1',
        uid: 'b2',
        firstName: 'John',
        lastName: 'Doe',
        displayName: "John Doe"
      } as Rider);

      expect(service.overwriteBalticStar(rider, info)).toEqual(expected);
    });

    it('should override profile', () => {
      const rider = new Rider('a1', 'b2');
      const info: ProviderInfo = {providerId: "oidc.balticstar", displayName: "John Doe"};
      const profile: ProviderDetails = {given_name: 'Jim', family_name: 'Bim', name: 'Jim Bim'} as ProviderDetails;
      const expected = Rider.fromDoc({
        owner: 'a1',
        uid: 'b2',
        firstName: 'Jim',
        lastName: 'Bim',
        displayName: "Jim Bim"
      } as Rider);

      expect(service.overwriteBalticStar(rider, info, profile)).toEqual(expected);
    });
  });
});
