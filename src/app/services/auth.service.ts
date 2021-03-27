import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable, of, Subject} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import firebase from 'firebase/app';
import {StorageService} from './storage.service';
import {Rider} from '../models/rider';
import {isNotNullOrUndefined} from '../utils';
import User = firebase.User;

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // may be either a Google Auth user or an UID-mapped rider
  user?: Rider;
  user$: Observable<Rider>;
  readonly unsubscribe$ = new Subject();

  constructor(public fireAuth: AngularFireAuth, storage: StorageService) {
    localStorage.setItem('user', '');
    this.user$ = this.fireAuth.authState.pipe(
      takeUntil(this.unsubscribe$),
      filter(isNotNullOrUndefined),
      switchMap((user: User) => user ?
        storage.watchRider(user.uid).pipe(
          filter(isNotNullOrUndefined),
          switchMap((rider: Rider) => rider ?
            of(Rider.fromDoc({...rider, auth: user} as Rider)) :
            of(Rider.fromDoc({auth: user} as Rider))
          )) :
        of(null)),
      filter(isNotNullOrUndefined)
    );
    this.user$.subscribe((user: Rider) => {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(this.user));
    });
  }

  // FIXME: when to destroy?
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user !== null;
  }

  get isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user !== null && user.admin;
  }

  async logout() {
    await this.fireAuth.signOut();
    localStorage.removeItem('user');
  }
}
