import {Injectable, OnDestroy} from '@angular/core';
import {StorageService} from './storage.service';
import {ProviderDetails, ProviderInfo, Rider, RiderPublicDetails, UserWithProfile} from '../models/rider';
import {map, switchMap, takeUntil} from 'rxjs/operators';

import {SettingService} from './setting.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {from, of, Subject} from 'rxjs';
import {Auth, getAuth, getRedirectResult, signOut, User} from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  public state$: Auth;
  // may be either a Google Auth user or an UID-mapped rider
  user?: Rider;
  user$ = new Subject<Rider | undefined>();
  readonly unsubscribe$ = new Subject();
  readonly logout$ = new Subject();

  constructor(
    public settings: SettingService,
    public storage: StorageService,
    private snackBar: MatSnackBar,
  ) {
    this.state$ = getAuth();
    this.settings.setValue('user', undefined);

    this.state$.onAuthStateChanged(this.stateObserver.bind(this),
      (error) => console.error('Authentication error', error));

    getRedirectResult(this.state$)
      .catch((error) => {
        console.error('Authentication error', error);
        this.snackBar.open(`Не удалось подключить аккаунт. ${error.message}`,
          'Закрыть');
      });

    this.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((user?: Rider) => this.setCurrentUser(user));
  }

// FIXME: when to destroy?
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  setCurrentUser(rider?: Rider) {
    this.user = rider;
    this.settings.setValue('user', this.user);
  }

  stateObserver(user: User|null) {
    if (user) {
      // retrieve additional rider info
      return this.storage.watchRider(user.uid).pipe(
        takeUntil(this.logout$),
        map((rider: Rider) => Rider.fromDoc({...rider, auth: user} as Rider)),
        switchMap((rider: Rider) => {
          this.user$.next(rider);
          if (rider.hasCard && this.copyProviders(rider, user)) {
            return from(this.storage.updateRider(rider));
          }
          return of();
        })
      ).toPromise();
    }
    else {
      return this.logout().then(() => console.log('Logout completed'));
    }
  }

  copyProviders(rider: Rider, user: UserWithProfile): boolean {
    let needUpdate = false;
    for (const data of user.providerData) {
      if (data?.providerId &&
        !rider.providers.find((p: ProviderInfo) => p.providerId === data.providerId)) {
        rider.providers.push(data);
        needUpdate = true;

        // special case of Baltic star
        this.overwriteBalticStar(rider, data, user.profile);
      }
    }
    return needUpdate;
  }

  overwriteBalticStar(rider: Rider, info?: ProviderInfo, profile?: ProviderDetails): Rider {
    if (info?.providerId === 'oidc.balticstar') {
      const [firstName, lastName] = Rider.splitName(info.displayName);
      Object.assign(rider, {firstName, lastName, displayName: info.displayName});

      if (profile) {
        const overwrite: RiderPublicDetails = Rider.copyProviderProfile(profile);
        Object.assign(rider, overwrite);
      }
    }
    return rider;
  }

  get isLoggedIn(): boolean {
    if (this.user === undefined) {
      this.user = this.settings.getValue('user');
    }
    return !!this.user;
  }

  get isAdmin(): boolean {
    if (this.user === undefined) {
      this.user = this.settings.getValue('user');
    }
    return !!this.user && this.user.admin;
  }

  logout(): Promise<void> {
    this.settings.removeKey('user');
    this.user$.next(undefined);
    this.logout$.next();
    return signOut(this.state$);
  }
}
