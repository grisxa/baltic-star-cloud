import {Component, OnInit} from '@angular/core';

import {AuthService} from '../../services/auth.service';
import {Brevet} from '../../models/brevet';
import {StorageService} from '../../services/storage.service';
import {Router} from '@angular/router';
import * as firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import {MatSnackBar} from '@angular/material/snack-bar';
import {Title} from '@angular/platform-browser';

const WEEK = 1000 * 60 * 60 * 24 * 7;

@Component({
  selector: 'app-brevet-list',
  templateUrl: './brevet-list.component.html',
  styleUrls: ['./brevet-list.component.scss']
})
export class BrevetListComponent implements OnInit {
  oldBrevets: Brevet[] = [];
  newBrevets: Brevet[] = [];

  constructor(private router: Router,
              public auth: AuthService,
              private titleService: Title,
              private storage: StorageService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.titleService.setTitle('Список бреветов');
    this.storage.listBrevets().subscribe(snapshot => {
      console.log('= brevets', snapshot.docs);
      const today = new Date();
      const recently = new Date(today.getTime() - WEEK);
      snapshot.docs.map(doc => doc.data() as Brevet)
        .forEach(brevet => brevet.startDate.toDate() < recently ?
          this.oldBrevets.push(brevet) :
          this.newBrevets.push(brevet)
        );
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
      .catch(error => {
        console.error('brevet removal has failed', error);
        this.snackBar.open(`Не удалось удалить бревет. ${error.message}`,
          'Закрыть', {duration: 5000});
      });
  }
}
