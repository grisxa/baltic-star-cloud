import {Injectable, OnDestroy} from '@angular/core';
import {StorageService} from './storage.service';
import {ExtraProviderInfo, mergeProviderInfo, ProviderInfo, Rider} from '../models/rider';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {SettingService} from './setting.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {from, of, Subject} from 'rxjs';
import {Auth, getAuth, getRedirectResult, signOut, User, UserInfo} from 'firebase/auth';

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
  private providerInfo: ExtraProviderInfo = {};

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
      .then((authResult?: any) => {
        this.providerInfo.providers = mergeProviderInfo(
          authResult?.user.providerData,
          [Rider.copyProviderInfo(authResult?.user) as UserInfo],
        );
        return authResult;
      })
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

  stateObserver(user: User|null): Promise<void> {
    if (user) {
      // retrieve saved encoded user details
      const overwrite = this.settings.getValue('info');
      this.settings.removeKey('info');

      this.storage.getRider(user.uid)
        .then(doc => Rider.fromDoc({...doc, auth: user} as Rider))
        .then((rider: Rider) => {
          rider.copyProviders(this.providerInfo.providers, this.providerInfo.profile);

          if (!rider.owner) {
            rider.owner = user.uid;
            rider.updateInfo(overwrite);
            // enable on creating
            rider.alive = true;
            return this.storage.createRider(rider)
              .then(() => this.user$.next(rider));
          }

          if (!!overwrite) {
            rider.updateInfo(overwrite);
            // update existing user
            return this.storage.updateRider(rider)
              .then(() => this.user$.next(rider));
          }

          return;
        })
        .catch(error => console.error('Login error', error));

      return this.storage.watchRider(user.uid).pipe(
        takeUntil(this.logout$),
        map((doc: Rider) => Rider.fromDoc({...doc, auth: user} as Rider)),
        switchMap((rider: Rider) => {
          const extraProviders: ProviderInfo[] = mergeProviderInfo(
            user.providerData,
            [Rider.copyProviderInfo(user) as UserInfo],
            this.providerInfo.providers as UserInfo[],
          );
          const needUpdate = rider.copyProviders(extraProviders, this.providerInfo.profile);
          this.user$.next(rider);
          if (rider.alive && needUpdate) {
            return from(this.storage.updateRider(rider));
          }
          return of<void>();
        }),
      ).toPromise();
    }
    else {
      return this.logout().then(() => console.log('Logout completed'));
    }
  }

  addProviderInfo(info: ExtraProviderInfo) {
    this.providerInfo = info;
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
    return signOut(this.state$)
      .then(() => {
        this.settings.removeKey('user');
        this.user$.next(undefined);
        this.logout$.next();
      })
      .catch((error: Error) => console.error('signOut has failed', error));
  }
}
