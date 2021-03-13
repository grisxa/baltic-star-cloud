import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Brevet} from '../../models/brevet';
import {Loading} from '../../models/loading';
import {CloudFirestoreService} from '../../services/storage/cloud-firestore.service';

const WEEK_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

@Component({
  selector: 'app-brevet-list',
  templateUrl: './brevet-list.component.html',
  styleUrls: ['./brevet-list.component.scss']
})
export class BrevetListComponent extends Loading implements OnInit, OnDestroy {
  oldBrevets: Brevet[] = [];
  newBrevets: Brevet[] = [];

  private unsubscribe$ = new Subject();

  constructor(private storage: CloudFirestoreService) {
    super();
  }

  ngOnInit(): void {
    this.loading = true;
    const now = Date.now();
    this.storage.listBrevets().pipe(takeUntil(this.unsubscribe$))
      .subscribe((brevets: Brevet[]) => {
        brevets.forEach(brevet => {
          // the old brevet either has finished
          // or started a week ago (and thus has finished as well)
          if (brevet.endDate?.valueOf() < now ||
            brevet.startDate.valueOf() < now - WEEK_MILLISECONDS) {
            // order from recent to older
            this.oldBrevets.unshift(brevet);
          } else {
            // keep ordering by startDate increasing
            this.newBrevets.push(brevet);
          }
        });
        this.loading = false;
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }
}
