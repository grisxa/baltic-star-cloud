import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FirebaseUISignInFailure, FirebaseUISignInSuccessWithAuthResult} from 'firebaseui-angular';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {SettingService} from '../../services/setting.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private auth: AuthService,
              private settings: SettingService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.route.url.subscribe((paths: UrlSegment[]) => {
      if (paths && paths.length) {
        this.settings.setValue('info', paths.join('/'));
      }
    });
    this.auth.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        if (user) {
          this.router.navigate(['after-login']);
        }
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  onSuccess(event: FirebaseUISignInSuccessWithAuthResult): boolean {
    const info = event.authResult.additionalUserInfo;
    if (info?.isNewUser) {
      event.authResult.user?.sendEmailVerification()
        .then(() => this.snackBar.open('Отправлено письмо с подтверждением',
          'Закрыть', {duration: 5000}))
        .catch((error: Error) => {
          console.error('email verification has failed', error);
          this.snackBar.open(`Не удалось отправить письмо. ${error.message}`,
            'Закрыть', {duration: 5000});
        });
    }
    this.router.navigate(['after-login']);
    return true;
  }

  onError(event: FirebaseUISignInFailure) {
    console.error('= login error', event);
    if (!(event instanceof TypeError)) {
      this.snackBar.open(`Ошибка входа. ${event.code}`,
        'Закрыть', {duration: 5000});
    }
  }
}
