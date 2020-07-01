import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {User} from 'firebase/app';
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
    this.auth.user$.subscribe((user: User|Rider) => {
      this.userName = user ? user.displayName : '';
      this.url = this.auth.hasCard ? `/rider/${user.uid}` : null;
    });
  }

}
