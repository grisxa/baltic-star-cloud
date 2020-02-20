import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth, User} from 'firebase/app';
import {Observable, of, Subject} from 'rxjs';
import {StorageService} from './storage.service';
import {switchMap} from 'rxjs/operators';
import {Rider} from '../models/rider';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // may be either a Google Auth user or an UID-mapped rider
  user: User|Rider;
  user$: Observable<User|Rider>;

  constructor(public afAuth: AngularFireAuth, storage: StorageService) {
    localStorage.setItem('user', null);
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user: User) => user ?
        storage.watchRider(user.uid).pipe(
          switchMap((rider: Rider) => rider ? of(rider) : of(user))
        ) : of(null))
    );
    this.user$.subscribe(user => {
      // console.log('= user', user);
      this.user = user;
      localStorage.setItem('user', JSON.stringify(this.user));
    });
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
    await this.afAuth.auth.signOut();
    localStorage.removeItem('user');
  }

  async loginWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    await this.afAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());
  }

}
