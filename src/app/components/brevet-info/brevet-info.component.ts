import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Brevet} from '../../models/brevet';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../../services/storage.service';
import {Observable, Subject} from 'rxjs';
import {AngularFirestoreDocument} from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import {Checkpoint} from '../../models/checkpoint';
import {MatTable, MatTableDataSource} from '@angular/material';
import {RiderCheckIn} from '../../models/rider-check-in';
import {Rider} from '../../models/rider';
import {takeUntil} from 'rxjs/operators';
import Timestamp = firebase.firestore.Timestamp;
import {PlotarouteInfoService} from '../../services/plotaroute-info.service';

@Component({
  selector: 'app-brevet-info',
  templateUrl: './brevet-info.component.html',
  styleUrls: ['./brevet-info.component.scss']
})
export class BrevetInfoComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  private brevet$: Observable<Brevet>;

  brevet: Brevet;
  mapId: number;
  formGroup: FormGroup;

  checkpoints$ = new Subject<Checkpoint[]>();
  checkpoints: Checkpoint[];

  @ViewChild(MatTable, {static: false}) table: MatTable<RiderCheckIn>;
  progress = new MatTableDataSource<RiderCheckIn>();
  columnsToDisplay = ['name'];
  columnNames = {name: 'Имя'};

  constructor(private route: ActivatedRoute,
              private router: Router,
              public auth: AuthService,
              private storage: StorageService,
              private routeService: PlotarouteInfoService) {
  }

  ngOnInit() {
    this.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      length: new FormControl(0, [Validators.required, Validators.pattern('[0-9]+')]),
      startDate: new FormControl(new Date(), Validators.required),
      mapUrl: new FormControl('', Validators.required),
    });

    this.route.paramMap.subscribe(params => {
      this.brevet$ = this.storage.getBrevet(params.get('uid'));
      this.storage.watchCheckpoints(params.get('uid'))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((checkpoints: Checkpoint[]) => {
          console.log('= checkpoints', checkpoints);
          this.checkpoints = checkpoints; // .map(doc => doc.data()) as Checkpoint[];
          this.columnsToDisplay = ['name'];
          this.columnNames = {name: 'Имя'};
          this.checkpoints.forEach((cp, i) => {
            const id = 'cp' + (i + 1);
            this.columnsToDisplay.push(id);
            this.columnNames[id] = cp.displayName;
          });
          this.checkpoints$.next(this.checkpoints);
        });
      this.storage.watchBrevetProgress(params.get('uid'))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((checkpoint: Checkpoint) => {
          // FIXME: avoid self-assignment
          this.progress.data = this.progress.data ? this.progress.data : [];

          console.log('got checkpoint', checkpoint);
          const checkpointIndex = this.checkpoints.findIndex(cp => cp.uid === checkpoint.uid);
          if (checkpointIndex === -1) {
            console.warn(`unknown checkpoint ${checkpoint.uid}`);
            return;
          }
          checkpoint.riders.forEach(rider => {
            const known = this.progress.data.find(row => row.uid === rider.uid);
            const checkIn = Array.isArray(rider.time) ? rider.time[0] : null;
            if (known) {
              // console.log('known rider', rider);
              known['cp' + (checkpointIndex + 1)] = checkIn;
            } else {
              // console.log('new rider', rider);
              const row = {
                name: rider.name,
                uid: rider.uid,
                ['cp' + (checkpointIndex + 1)]: checkIn
              } as RiderCheckIn;
              this.progress.data.push(row);
            }
            this.table.renderRows();
          });
          // console.log('= updated table', this.progress.data);
          // this.dataSource.paginator = this.paginator;
        });
    });
    this.brevet$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(brevet => {
        this.brevet = brevet;
        this.formGroup.get('name').setValue(brevet.name);
        this.formGroup.get('length').setValue(brevet.length);
        this.formGroup.get('mapUrl').setValue(brevet.mapUrl);
        this.mapId = this.findMapId(brevet.mapUrl);
        this.formGroup.get('startDate').setValue(brevet.startDate ? brevet.startDate.toDate() : null);
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  findMapId(url: string): number {
    if (!url) {
      return;
    }
    const idSearch = url.match('/route/(\\d+)');
    if (idSearch && idSearch.length > 1) {
      return parseInt(idSearch[1], 10);
    }
  }

  updateMapUrl() {
    const control = this.formGroup.get('mapUrl');
    if (control && control.valid) {
      const mapId = this.findMapId(control.value);
      // ignore URL updates if map ID hasn't changed
      if (mapId === this.findMapId(this.brevet.mapUrl)) {
        return;
      }
      this.routeService.retrieve(mapId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(data => {
            this.brevet.name = data.name;
            this.formGroup.get('name').setValue(data.name);

            this.brevet.length = data.length;
            this.formGroup.get('length').setValue(data.length);

            if (data.checkpoints && data.checkpoints.length) {
              data.checkpoints.forEach(checkpoint => this.storage.createCheckpoint(this.brevet,
                new Checkpoint('', checkpoint.name, checkpoint.distance)));
            }

            this.updateField('mapUrl');
          },
          error => {
            console.error(error);
            // switch back in case of retrieval error
            control.setValue(this.brevet.mapUrl);
          });
    } else {
      // switch back if new value is invalid
      control.setValue(this.brevet.mapUrl);
    }
  }

  updateField(field: string) {
    const control = this.formGroup.get(field);
    if (this.brevet === undefined) {
      return;
    }
    if (control && control.valid) {
      // check if the field needs updating
      if (control.value instanceof Date) {
        const value = Timestamp.fromDate(control.value);
        if (this.brevet[field] && this.brevet[field].seconds === value.seconds) {
          return;
        } else {
          this.brevet[field] = value;
        }
      } else {
        if (this.brevet[field] === control.value) {
          return;
        } else {
          this.brevet[field] = control.value;
        }
      }

      console.log(`= update ${field} with ${control.value}`);
      this.storage.updateBrevet(this.brevet)
        .then(() => {
          console.log(`= updated brevet ${this.brevet.uid}`);
        })
        .catch(error => console.error('brevet update has failed', error.message));
    } else {
      // console.log(`= backup form ${field} from ${control.value} to ${this.rider[field].toDate()}`);
      control.setValue(this.brevet[field] instanceof Timestamp ?
        this.brevet[field].toDate() :
        this.brevet[field]
      );
    }
  }

  addCheckpoint() {
    console.log('= add checkpoint');
    const checkpoint = new Checkpoint('', 'Новый', 0);
    this.storage.createCheckpoint(this.brevet, checkpoint).then(uid => {
      this.router.navigate(['brevet', this.brevet.uid, 'checkpoint', uid]);
    });
  }

  deleteCheckpoint(uid: string) {
    console.log('= delete checkpoint', uid);
    this.storage.deleteCheckpoint(this.brevet.uid, uid)
      .then(() => {
        console.log(`= removed cp ${uid}`);
      })
      .catch(error => console.error('checkpoint deletion has failed', error.message));
  }
}
