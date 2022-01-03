import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {Subject} from 'rxjs';
import {SettingService} from '../../services/setting.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import {takeUntil} from 'rxjs/operators';
import {ProviderDetails, Rider} from '../../models/rider';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import {environment} from 'src/environments/environment';
import UserCredential = firebase.auth.UserCredential;
import AuthUIError = firebaseui.auth.AuthUIError;
import UserInfo = firebase.UserInfo;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  private authUI?: firebaseui.auth.AuthUI;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private auth: AuthService,
              private settings: SettingService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.authUI = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
    this.authUI?.start('#firebaseui-auth', {
        ...environment.auth,
        callbacks: {
          signInSuccessWithAuthResult: this.onSuccess.bind(this),
          signInFailure: this.onError.bind(this),
        },
      }
    );

    this.route.url.subscribe((paths: UrlSegment[]) => {
      if (paths && paths.length) {
        this.settings.setValue('info', paths.join('/'));
      }
    });
    this.auth.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((user?: Rider) => {
        if (user) {
          this.router.navigate(['after-login'])
            .catch(error => console.error('Navigation failed', error));
        }
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.authUI?.delete();
  }

  onSuccess(authResult: UserCredential, redirectUrl: string): boolean {
    // GoogleAdditionalUserInfo / GenericAdditionalUserInfo
    const info = authResult.additionalUserInfo;
    if (info?.isNewUser && info?.providerId === firebase.auth.EmailAuthProvider.PROVIDER_ID) {
      authResult.user?.sendEmailVerification()
        .then(() => this.snackBar.open('Отправлено письмо с подтверждением',
          'Закрыть'))
        .catch((error: Error) => {
          console.error('email verification has failed', error);
          this.snackBar.open(`Не удалось отправить письмо. ${error.message}`,
            'Закрыть');
        });
    }
    if (info?.isNewUser) {
      const provider = Object.assign({},
        Rider.copyProviderInfo(authResult.user),
        Rider.copyAdditionalInfo(info.profile as ProviderDetails, info.providerId) as UserInfo
      );
      authResult.user?.providerData?.push(provider);
    }
    this.router.navigate(['after-login'])
      .catch((error: Error) => console.warn(`Navigation error: ${error.message}`));
    return true;
  }

  onError(error: AuthUIError) {
    if (!(error instanceof TypeError)) {
      this.snackBar.open(`Ошибка входа. ${error.code}`,
        'Закрыть');
    }
  }
}
