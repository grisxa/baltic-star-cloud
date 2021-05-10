import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Rider} from '../../models/rider';

@Component({
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPromptComponent implements OnInit, OnDestroy {
  userName = 'unknown';
  url = '';
  readonly unsubscribe$ = new Subject();

  constructor(public auth: AuthService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.cd.detach();
    this.auth.user$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((user: Rider | null) => {
        this.userName = user ? user.displayName : '';
        if (user && user.hasCard) {
          this.url = `/rider/${user.uid}`;
        }
        this.cd.detectChanges();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

}
