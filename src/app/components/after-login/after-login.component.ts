import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Rider} from '../../models/rider';
import {StorageService} from '../../services/storage.service';

@Component({
  template: ''
})
export class AfterLoginComponent implements OnInit {

  constructor(private router: Router,
              private auth: AuthService,
              private storage: StorageService) {
  }

  ngOnInit(): void {
    // create a card for the new account and redirect to it
    if (this.auth.user && !this.auth.hasCard) {
      const displayName = this.auth.user.displayName || '';
      const name = displayName.split(/\s+/);
      const lastName = name.pop() || '';
      const firstName = name.shift() || '';

      const uid = this.auth.user.uid;
      const rider = new Rider(uid, uid, firstName, lastName);
      this.storage.createRider(rider).then(newUid => {
        this.router.navigate(['rider', newUid]);
      });

    } else {
      // or go back to the main page
      this.router.navigate(['brevets']);
    }
  }
}
