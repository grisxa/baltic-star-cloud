import {TestBed, waitForAsync} from '@angular/core/testing';

import {AuthService} from './auth.service';
import {StorageService} from './storage.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {SettingService} from './setting.service';
import {Rider} from '../models/rider';
import {of} from 'rxjs';
import {connectAuthEmulator, getAuth, User} from 'firebase/auth';
import {initializeApp} from 'firebase/app';
import {environment} from '../../environments/environment.test';


class MockStorageService {
  watchRider = (uid: string) => of(new Rider('e5', 'f6'));
  updateRider = (rider?: Rider) => Promise.resolve();
}

class MockSettingService {
  store: { [key: string]: string|undefined } = {};
  getValue = (key: string) => this.store[key] === 'undefined' ? undefined : JSON.parse(this.store[key] || 'null');
  setValue = (key: string, value: string) => this.store[key] = JSON.stringify(value);
  removeKey = (key: string) => delete this.store[key];
}

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(waitForAsync( () => {
    connectAuthEmulator(getAuth(initializeApp(environment.firebase)), 'http://localhost:9099');
  }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [

        MatSnackBarModule,
      ],
      providers: [
        {provide: StorageService, useClass: MockStorageService},
        {provide: SettingService, useClass: MockSettingService},
      ],
      declarations: []
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(AuthService);
    spyOn(service.settings, 'setValue');
    spyOn(service.settings, 'removeKey');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect((service.settings as unknown as MockSettingService).store).toEqual({user: undefined});
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

  it('should reset the current user', () => {
    service.user = new Rider('a1', 'b2');
    spyOn(service.state$, 'signOut').and.callFake(() => Promise.resolve());

    service.logout();

    expect(service.settings.removeKey).toHaveBeenCalledOnceWith('user');
    expect(service.user).not.toBeDefined();
    expect(service.settings.removeKey).toHaveBeenCalled();
    expect(service.state$.signOut).toHaveBeenCalled();
  });

  describe('stateObserver', () => {
    let rider: Rider;

    beforeEach(() => {
      rider = new Rider('c3', 'd4');
      spyOn(service, 'logout').and.resolveTo();
      spyOn(service, 'setCurrentUser').and.returnValue();
      spyOn(service.storage, 'watchRider').and.returnValue(of(rider));
      spyOn(service.storage, 'updateRider').and.resolveTo();
    });

    afterEach(async () => await service.user$.complete());

    it('should skip null user', () => {
      service.stateObserver(null);

      expect(service.storage.watchRider).not.toHaveBeenCalled();
      expect(service.setCurrentUser).not.toHaveBeenCalled();
    });

    it('should search for user', async () => {
      const user = {uid: 'abc'} as User;
      const expected = Rider.fromDoc({ owner: 'c3', uid: 'd4', auth: user} as Rider);
      spyOn(rider, 'copyProviders').and.returnValue(false);
      expected.copyProviders = rider.copyProviders;

      await service.stateObserver(user);

      expect(service.storage.watchRider).toHaveBeenCalledOnceWith('abc');
      expect(rider.copyProviders).not.toHaveBeenCalled();
      expect(service.storage.updateRider).not.toHaveBeenCalled();
      expect(service.setCurrentUser).toHaveBeenCalledOnceWith(expected);
    });

    it('should find and update the user', async () => {
      const user = {uid: 'abc'} as User;
      rider.code = 'e5';
      const expected = Rider.fromDoc({ owner: 'c3', uid: 'd4', code: 'e5', auth: user} as Rider);
      spyOn(rider, 'copyProviders').and.returnValue(true);
      expected.copyProviders = rider.copyProviders;

      await service.stateObserver(user);

      expect(service.storage.watchRider).toHaveBeenCalledOnceWith('abc');
      expect(rider.copyProviders).toHaveBeenCalledOnceWith([user], undefined);
      expect(service.storage.updateRider).toHaveBeenCalledOnceWith(expected);
      expect(service.setCurrentUser).toHaveBeenCalledOnceWith(expected);
    });
  });
});
