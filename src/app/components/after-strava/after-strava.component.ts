import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StravaActivityService} from '../../services/strava-activity.service';
import {SettingService} from '../../services/setting.service';
import {StravaTokens} from '../../models/strava-tokens';

@Component({
  template: ''
})
export class AfterStravaComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private strava: StravaActivityService,
    public settings: SettingService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.unsubscribe$))
      .subscribe(query => {
        const back = query.back;

        if ('state' in query) {
          if ('error' in query && query.error === 'access_denied') {
            this.snackBar.open(`Доступ запрещён`, 'Закрыть');
            this.router.navigateByUrl(back)
              .catch((error: Error) => console.warn(`Navigation error: ${error.message}`));
            return;
          }
          if ('scope' in query && !query.scope.includes('activity:read')) {
            this.snackBar.open(`Не достаточно разрешений`, 'Закрыть');
            this.router.navigateByUrl(back)
              .catch((error: Error) => console.warn(`Navigation error: ${error.message}`));
            return;
          }
          if (query.code) {
            this.strava.getToken(query.code)
              .then((tokens: StravaTokens) => this.settings.setValue('strava', tokens))
              .catch((error: Error) => {
                this.snackBar.open(`Ошибка. ${error.message}`, 'Закрыть');
                console.error(error);
              })
              .finally(() => this.router.navigateByUrl(back));
          }
        }
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }
}
