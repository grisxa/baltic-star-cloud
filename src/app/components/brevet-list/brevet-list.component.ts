import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {AuthService} from '../../services/auth.service';
import {Brevet} from '../../models/brevet';
import {StorageService} from '../../services/storage.service';
import {Timestamp} from 'firebase/firestore';
import {getFunctions, httpsCallable} from '@angular/fire/functions';

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
              private storage: StorageService) {
  }

  ngOnInit() {
    this.titleService.setTitle('Список бреветов');
    this.storage.listBrevets()
      .then((brevets) => {
      const today = new Date();
      const recently = new Date(today.getTime() - WEEK);
      brevets.forEach((brevet: Brevet) => brevet.startDate.toDate() < recently ?
          this.oldBrevets.push(brevet) :
          this.newBrevets.push(brevet)
        );
      console.log('= brevets', this.oldBrevets, this.newBrevets);
    });
  }

  addBrevet() {
    const brevet = new Brevet('', 'Новый', 0, Timestamp.now());
    this.storage.createBrevet(brevet).then(uid => {
      this.router.navigate(['brevet', uid])
        .catch(error => console.error('Navigation failed', error));
    });
  }

  saveBrevets() {
    const saveBrevetList = httpsCallable(getFunctions(),'saveBrevetList');
    return saveBrevetList()
      .then((result) => result.data);
  }
}
