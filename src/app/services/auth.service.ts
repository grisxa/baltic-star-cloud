import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {of, Subject} from 'rxjs';
import {StorageService} from './storage.service';
import {Rider} from '../models/rider';
import {switchMap, takeUntil} from 'rxjs/operators';
import firebase from 'firebase';
import User = firebase.User;

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // may be either a Google Auth user or an UID-mapped rider
  user?: Rider | null;
  user$ = new Subject<Rider | null>();
  readonly unsubscribe$ = new Subject();

  constructor(public fireAuth: AngularFireAuth, storage: StorageService) {
    localStorage.setItem('user', '');
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
        localStorage.setItem('user', JSON.stringify(this.user));
      });
  }

  // FIXME: when to destroy?
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  get isLoggedIn(): boolean {
    if (this.user === undefined) {
      this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }
    return this.user !== null;
  }

  get isAdmin(): boolean {
    if (this.user === undefined) {
      this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }
    // console.log('=isAdmin', user, user !== null && user.admin);
    return this.user !== null && !!this.user?.admin;
  }

  async logout() {
    localStorage.removeItem('user');
    this.user$.next(null);
    await this.fireAuth.signOut();
  }
}
