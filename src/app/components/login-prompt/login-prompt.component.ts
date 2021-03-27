import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Rider} from '../../models/rider';

@Component({
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.scss']
})
export class LoginPromptComponent implements OnInit {
  userName = 'unknown';
  url = '';

  constructor(public auth: AuthService) { }

  ngOnInit() {
    this.auth.user$.subscribe((user: Rider|null) => {
      this.userName = user ? user.displayName : '';
      if (user && user.hasCard) {
        this.url = `/rider/${user.uid}`;
      }
    });
  }

}
