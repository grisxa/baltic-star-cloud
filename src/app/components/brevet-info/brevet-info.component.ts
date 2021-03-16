import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Brevet} from '../../models/brevet';
import {Loading} from '../../models/loading';
import {CloudFirestoreService} from '../../services/storage/cloud-firestore.service';

@Component({
  selector: 'app-brevet-info',
  templateUrl: './brevet-info.component.html',
  styleUrls: ['./brevet-info.component.scss']
})
export class BrevetInfoComponent extends Loading implements OnInit, OnDestroy {
  brevet: Brevet;
  checkpointsOpenState = false;

  private unsubscribe$ = new Subject();
  private brevet$: Observable<Brevet>;

  constructor(
    private route: ActivatedRoute,
    private storage: CloudFirestoreService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.brevet$ = this.storage.getBrevet(params.get('uid'));
      this.brevet$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(brevet => {
          this.brevet = brevet;
          this.loading = false;
        });
    });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }
}
