import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Rider} from '../../models/rider';
import {StorageService} from '../../services/storage.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SettingService} from '../../services/setting.service';

@Component({
  template: ''
})
export class AfterLoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  constructor(private router: Router,
              private auth: AuthService,
              private settings: SettingService,
              private storage: StorageService) {
  }

  ngOnInit(): void {
    const info = this.settings.getValue('info') || '';
    this.settings.removeKey('info');

    this.auth.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((user: Rider|null) => {
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