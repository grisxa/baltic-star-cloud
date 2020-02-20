import {Component, OnInit} from '@angular/core';

import {AuthService} from '../../services/auth.service';
import {Brevet} from '../../models/brevet';
import {StorageService} from '../../services/storage.service';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-brevet-list',
  templateUrl: './brevet-list.component.html',
  styleUrls: ['./brevet-list.component.scss']
})
export class BrevetListComponent implements OnInit {
  brevets$ = new Subject<Brevet[]>();

  constructor(private router: Router, public auth: AuthService, private storage: StorageService) {
  }

  ngOnInit() {
    this.storage.listBrevets().subscribe(snapshot => {
      console.log('= brevets', snapshot.docs);
      this.brevets$.next(snapshot.docs.map(doc => doc.data()) as Brevet[]);
    });
  }

  addBrevet() {
    const brevet = new Brevet('', 'Новый', 0, Timestamp.now());
    this.storage.createBrevet(brevet).then(uid => {
      this.router.navigate(['brevet', uid]);
    });
  }

  deleteBrevet(uid: string) {
    console.log('= delete brevet', uid);
    this.storage.deleteBrevet(uid)
      .then(() => {
        console.log(`= removed brevet ${uid}`);
      })
      .catch(error => console.error('checkpoint deletion has failed', error.message));
  }
}
