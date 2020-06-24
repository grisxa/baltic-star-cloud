import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subject} from 'rxjs';
import {Rider} from '../../models/rider';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import * as firebase from 'firebase/app';
import {takeUntil} from 'rxjs/operators';
import {User} from 'firebase/app';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-rider-list',
  templateUrl: './rider-list.component.html',
  styleUrls: ['./rider-list.component.scss']
})
export class RiderListComponent implements OnInit, OnDestroy {
  riders$ = new Subject<Rider[]>();
  unsubscribe$ = new Subject();

  constructor(private router: Router,
              public auth: AuthService,
              private storage: StorageService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.storage.watchRiders()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((riders: Rider[]) => {
      console.log('= riders', riders);
      this.riders$.next(riders);
    });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  addRider() {
    const name = this.auth.user.displayName.split(/\s+/);
    const lastName = name.pop() || '?';
    const firstName = name.shift() || '?';

    const uid = this.auth.user.uid;
    const rider = new Rider(uid, uid, firstName, lastName);
    this.storage.createRider(rider).then(newUid => {
      this.router.navigate(['rider', newUid]);
    });
  }

  deleteRider(uid: string) {
    console.log('= delete rider', uid);
    this.storage.deleteRider(uid)
      .then(() => {
        console.log(`= removed rider ${uid}`);
      })
      .catch(error => {
        console.error('rider deletion has failed', error);
        this.snackBar.open(`Не удалось удалить КП. ${error.message}`,
          'Закрыть', {duration: 5000});
      });
  }
}
