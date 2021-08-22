import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subject} from 'rxjs';
import {Rider} from '../../models/rider';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import {takeUntil} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-rider-list',
  templateUrl: './rider-list.component.html',
  styleUrls: ['./rider-list.component.scss']
})
export class RiderListComponent implements OnInit, OnDestroy {
  riders$ = new Subject<Rider[]>();
  unsubscribe$ = new Subject();

  constructor(private router: Router,
              public auth: AuthService,
              private titleService: Title,
              private storage: StorageService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.titleService.setTitle('Список участников');
    this.storage.watchRiders()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((riders: Rider[]) => this.riders$.next(riders))
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  addRider() {
    if (!this.auth.user) {
      return;
    }
    const owner = this.auth.user.uid;
    // admin creates new cards
    // new user creates own card
    const uid = this.auth.user.hasCard ? this.auth.isAdmin ? '' : owner : owner;
    const rider = new Rider(owner, uid, this.auth.user.displayName);
    this.storage.createRider(rider).then(newUid => {
      this.router.navigate(['rider', newUid]);
    });
  }

  deleteRider(uid: string) {
    this.storage.deleteRider(uid)
      .catch(error => {
        console.error('rider deletion has failed', error);
        this.snackBar.open(`Не удалось удалить КП. ${error.message}`,
          'Закрыть');
      });
  }
}
