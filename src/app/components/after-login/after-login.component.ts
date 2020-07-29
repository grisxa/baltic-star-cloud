import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Rider} from '../../models/rider';
import {StorageService} from '../../services/storage.service';
import {Subject} from 'rxjs';
import {first, takeUntil} from 'rxjs/operators';

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
    const info = localStorage.getItem('info');
    localStorage.removeItem('info');

    this.auth.user$.pipe(takeUntil(this.unsubscribe$), first())
      .subscribe((user: Rider) => {
        // create a card for the new account and redirect to it
        if (user && !user.hasCard) {
          user.owner = user.uid;
          user.updateInfo(info);
          this.storage.createRider(user).then(newUid => {
            this.router.navigate(['rider', newUid]);
          });

        } else if (user && info) {
          // update existing user
          user.updateInfo(info);
          this.storage.updateRider(user).then(() => {
            this.router.navigate(['rider', user.uid]);
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
