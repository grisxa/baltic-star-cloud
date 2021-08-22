import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {of, Subject} from 'rxjs';
import {StorageService} from './storage.service';
import {ProviderDetails, ProviderInfo, Rider, RiderDetails} from '../models/rider';
import {switchMap, takeUntil} from 'rxjs/operators';
import firebase from 'firebase/app';
import {SettingService} from './setting.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import User = firebase.User;
import UserInfo = firebase.UserInfo;

type PendingProfiles = {
  [name: string]: {
    info: ProviderInfo;
    profile?: ProviderDetails;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // may be either a Google Auth user or an UID-mapped rider
  user?: Rider;
  user$ = new Subject<Rider | undefined>();
  readonly unsubscribe$ = new Subject();
  private pendingProfiles: PendingProfiles = {};

  constructor(
    public fireAuth: AngularFireAuth,
    private settings: SettingService,
    private storage: StorageService,
    private snackBar: MatSnackBar,
  ) {
    this.settings.setValue('user', '');
    this.fireAuth.getRedirectResult()
      .then((result) => {
        if (result.additionalUserInfo) {
          const providerId = result.additionalUserInfo.providerId;
          const profile = result.additionalUserInfo.profile as ProviderDetails;
          this.pendingProfiles[providerId] = {
            profile,
            info: Rider.copyAdditionalInfo(profile, providerId)
          };
          const user = result.user;
        }
      }).catch((error) => {
        console.error('Authentication error', error);
        this.snackBar.open(`Не удалось подключить аккаунт. ${error.message}`,
          'Закрыть');
      });

    this.fireAuth.authState.pipe(
      takeUntil(this.unsubscribe$),
      switchMap((user: User | null) => user !== null
        ? storage.getRider(user?.uid).pipe(
          switchMap((rider?: Rider) => {
            if (rider !== undefined) {
              const providerInfo: UserInfo | null = user?.providerData[0];
              if (providerInfo?.providerId) {
                this.pendingProfiles[providerInfo.providerId] = {
                  info: providerInfo,
                  profile: undefined,
                };
              }
              return of(Rider.fromDoc({...rider, auth: user} as Rider));
            } else {
              return of(Rider.fromDoc({auth: user} as Rider));
            }
          })
        )
        : of(undefined)),
      )
      .subscribe(
        (user?: Rider) => {
          if (this.pendingProfiles && Object.keys(this.pendingProfiles).length) {
            for (const [name, data] of Object.entries(this.pendingProfiles)) {
              if (data.info?.providerId &&
                !user?.providers?.find(p => p.providerId === data.info?.providerId)) {
                user?.providers?.push(data.info);

                // special case of Baltic star
                if (data.info.providerId === 'oidc.balticstar') {
                  const [firstName, lastName] = Rider.splitName(data.info?.displayName);
                  Object.assign(user, {firstName, lastName});
                  if (data.profile) {
                    const overwrite: RiderDetails = Rider.copyProviderProfile(data.profile);
                    Object.assign(user, overwrite);
                  }
                }
              }
            }
            this.storage.updateRider(user)
              .catch((error) => console.error('Rider update error', error));
            this.pendingProfiles = {};
          }
          this.user$.next(user);
        }
      );

    this.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((user?: Rider) => {
        this.user = user;
        this.settings.setValue('user', this.user);
      });
  }

  private addPendingProviders(user: firebase.User, rider: Rider) {
    const providerInfo: UserInfo | null = user?.providerData[0];
    if (providerInfo?.providerId &&
      !rider.providers?.find(p => p.providerId === providerInfo?.providerId)) {
      this.pendingProfiles[providerInfo.providerId] = {
        info: providerInfo,
        profile: undefined,
      };
    }
  }

// FIXME: when to destroy?
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  get isLoggedIn(): boolean {
    if (this.user === undefined) {
      this.user = this.settings.getValue('user');
    }
    return this.user !== undefined;
  }

  get isAdmin(): boolean {
    if (this.user === undefined) {
      this.user = this.settings.getValue('user');
    }
    return this.user !== null && !!this.user?.admin;
  }

  hasProvider(id: string): boolean {
    return !!this.user?.providers?.find((p: ProviderInfo) => p.providerId === id)
  }

  async logout() {
    this.settings.removeKey('user');
    this.user$.next(undefined);
    await this.fireAuth.signOut();
  }
}
