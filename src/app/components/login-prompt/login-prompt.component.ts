import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Rider} from '../../models/rider';

@Component({
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.scss'],
})
export class LoginPromptComponent implements OnInit, OnDestroy {
  userName = 'unknown';
  userUid? = '';
  readonly unsubscribe$ = new Subject();

  constructor(public auth: AuthService) {
  }

  setupUser(user?: Rider) {
    this.userName = user?.displayName || 'unknown';
    this.userUid = user?.uid;
  }

  ngOnInit() {
    this.setupUser(this.auth.user);
    this.auth.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((user?: Rider) => this.setupUser(user));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

}
