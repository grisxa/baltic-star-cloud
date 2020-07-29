import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {User} from 'firebase/app';
import {Observable, of, Subject} from 'rxjs';
import {StorageService} from './storage.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {Rider} from '../models/rider';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // may be either a Google Auth user or an UID-mapped rider
  user: Rider;
  user$: Observable<Rider>;
  private unsubscribe$ = new Subject();

  constructor(public fireAuth: AngularFireAuth, storage: StorageService) {
    localStorage.setItem('user', null);
    this.user$ = this.fireAuth.authState.pipe(
      takeUntil(this.unsubscribe$),
      switchMap((user: User) => user ?
        storage.watchRider(user.uid).pipe(
          switchMap((rider: Rider) => rider ?
            of(Rider.fromDoc({...rider, auth: user} as Rider)) :
            of(Rider.fromDoc({auth: user} as Rider))
          )) :
        of(null))
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
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  get isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null && user.admin === true;
  }

  async logout() {
    await this.fireAuth.signOut();
    localStorage.removeItem('user');
  }
}
