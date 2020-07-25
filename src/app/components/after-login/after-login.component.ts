import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Rider} from '../../models/rider';
import {StorageService} from '../../services/storage.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  template: ''
})
export class AfterLoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  constructor(private router: Router,
              private auth: AuthService,
              private storage: StorageService) {
  }

  ngOnInit(): void {
    this.auth.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        // create a card for the new account and redirect to it
        if (user && !this.auth.hasCard) {
          const uid = this.auth.user.uid;
          const rider = new Rider(uid, uid, this.auth.user.displayName);
          this.storage.createRider(rider).then(newUid => {
            this.router.navigate(['rider', newUid]);
          });

        } else {
          // or go back to the main page
          this.router.navigate(['brevets']);
        }
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }
}
