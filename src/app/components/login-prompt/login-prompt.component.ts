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
  url = '';
  readonly unsubscribe$ = new Subject();

  constructor(public auth: AuthService) {
  }

  ngOnInit() {
    this.auth.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((user?: Rider) => {
        this.userName = user?.displayName || '';
        if (user && user.hasCard) {
          this.url = `/rider/${user.uid}`;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

}
