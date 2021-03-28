import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {of, Subject} from 'rxjs';
import {StorageService} from './storage.service';
import {Rider} from '../models/rider';
import {switchMap, takeUntil} from 'rxjs/operators';
import firebase from 'firebase';
import {SettingService} from './setting.service';
import User = firebase.User;

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // may be either a Google Auth user or an UID-mapped rider
  user?: Rider | null;
  user$ = new Subject<Rider | null>();
  readonly unsubscribe$ = new Subject();

  constructor(
    public fireAuth: AngularFireAuth,
    private settings: SettingService,
    private storage: StorageService
  ) {
    this.settings.setValue('user', '');
    this.fireAuth.authState.pipe(
      takeUntil(this.unsubscribe$),
      switchMap((user: User | null) => user ?
        storage.watchRider(user.uid).pipe(
          switchMap((rider: Rider) => rider ?
            of(Rider.fromDoc({...rider, auth: user} as Rider)) :
            of(Rider.fromDoc({auth: user} as Rider))
          )) : of(null)))
      .subscribe(
        user => {
          this.user$.next(user);
        }
      );
    this.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        this.user = user;
        this.settings.setValue('user', this.user);
      });
  }

  // FIXME: when to destroy?
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  get isLoggedIn(): boolean {
    if (this.user === undefined) {
      this.user = this.settings.getValue('user');
    }
    return this.user !== null;
  }

  get isAdmin(): boolean {
    if (this.user === undefined) {
      this.user = this.settings.getValue('user');
    }
    // console.log('=isAdmin', user, user !== null && user.admin);
    return this.user !== null && !!this.user?.admin;
  }

  async logout() {
    this.settings.removeKey('user');
    this.user$.next(null);
    await this.fireAuth.signOut();
  }
}
