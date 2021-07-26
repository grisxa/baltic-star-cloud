import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {MatSort} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';
import firebase from 'firebase/app';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {Brevet, NONE_BREVET} from '../../models/brevet';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import {Checkpoint, NONE_CHECKPOINT} from '../../models/checkpoint';
import {RiderCheckIn} from '../../models/rider-check-in';
import {PlotarouteInfoService} from '../../services/plotaroute-info.service';
import {RoutePoint} from '../../models/route-point';
import {LocationService} from '../../services/location.service';
import {ScannerDialogComponent} from '../../scanner-dialog/scanner-dialog.component';
import {Barcode} from '../../models/barcode';
import {CheckpointNotFound} from '../../models/checkpoint-not-found';
import {SettingService} from '../../services/setting.service';
import {isNotNullOrUndefined} from '../../utils';
import {BarcodeQueueService} from '../../services/barcode-queue.service';
import {Offline} from '../../models/offline';
import {MapboxLocationDialogComponent} from '../mapbox-location-dialog/mapbox-location-dialog.component';
import {Rider} from '../../models/rider';
import {StravaActivityService, tokenExpired} from '../../services/strava-activity.service';
import {environment} from '../../../environments/environment';
import Timestamp = firebase.firestore.Timestamp;

type ProgressColumn = {
  id: string;
  name: string;
  type: string;
  distance: string;
};

const firstColumn: ProgressColumn = { id: 'name', name: 'Имя', type: '', distance: ''};

@Component({
  selector: 'app-brevet-info',
  templateUrl: './brevet-info.component.html',
  styleUrls: ['./brevet-info.component.scss']
})
export class BrevetInfoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<RiderCheckIn>;
  @ViewChild(MatSort) sort!: MatSort;

  brevet?: Brevet;
  mapId?: number;
  formGroup: FormGroup;
  showMap = false;
  stravaClientId: string = environment.strava.clientId;

  checkpoints$ = new Subject<Checkpoint[]>();
  checkpoints: Checkpoint[] = [];
  riders: Rider[] = [];

  // FIXME: consider pre-defined
  // dynamic column names like cp, cp3 (no pre-defined count)
  progress = new MatTableDataSource<RiderCheckIn>();
  columnsToDisplay: ProgressColumn[] = [firstColumn];
  firstHeader = [firstColumn.id];
  secondHeader = ['dist-' + firstColumn.id];

  private unsubscribe$ = new Subject();
  private brevet$: Observable<Brevet> = of({} as Brevet);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              public auth: AuthService,
              private storage: StorageService,
              public settings: SettingService,
              private queue: BarcodeQueueService,
              public dialog: MatDialog,
              public geoLocation: LocationService,
              private routeService: PlotarouteInfoService,
              private strava: StravaActivityService,
              private snackBar: MatSnackBar) {
    this.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      length: new FormControl(0, [Validators.required, Validators.pattern('[0-9]+')]),
      startDate: new FormControl(new Date(), Validators.required),
      mapUrl: new FormControl('', Validators.required),
    });
  }

  // try sending old codes again
  @HostListener('window:online')
  onConnectionBack() {
    this.queue.repeatSending();
  }

  ngAfterViewInit() {
    this.progress.sort = this.sort;
    setTimeout( () => this.sort
      .sort({id: 'lastName', start: 'asc', disableClear: true}), 0);
  }

  ngOnInit() {
    this.titleService.setTitle('Бревет');
    combineLatest([this.route.queryParams, this.route.paramMap])
    .subscribe(params => {
      const [query, route] = params;
      const brevetUid = route.get('uid');

      if ('state' in query) {
        console.log('= strava token', query);
        if ('error' in query && query.error === 'access_denied') {
          this.snackBar.open(`Доступ запрещён`, 'Закрыть');
          this.router.navigate(['brevet', brevetUid])
            .catch((error: Error) => console.warn(`Navigation error: ${error.message}`));
          return;
        }
        if ('scope' in query && !query.scope.includes('activity:read')) {
          this.snackBar.open(`Не достаточно разрешений`, 'Закрыть');
          this.router.navigate(['brevet', brevetUid])
            .catch((error: Error) => console.warn(`Navigation error: ${error.message}`));
          return;
        }
        if (query.code) {
          this.snackBar.open(`Поиск запущен`, 'Закрыть');
          this.strava.getToken(query.code)
            .then((reply: unknown) => console.log('= strava token', reply))
            .then(() => console.log('= import strava'))
            .then(() => this.router.navigate(['brevet', brevetUid]))
            .catch((error: Error) => {
              this.snackBar.open(`Ошибка. ${error.message}`, 'Закрыть');
              console.error(error);
            });
        }
      }
    });
    this.storage.watchRiders()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((riders: Rider[]) => {
        this.riders = riders;
      });
    this.storage.listCheckpoints()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((snapshot) => {
        console.log(snapshot.docs.length + ' checkpoints in a cache');
      });
    this.route.paramMap.subscribe(params => {
      const brevetUid = params.get('uid');
      if (!brevetUid) {
        return;
      }
      this.brevet$ = this.storage.getBrevet(brevetUid);
      this.storage.watchCheckpoints(brevetUid)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((checkpoints: Checkpoint[]) => {
          // console.log('= checkpoints', checkpoints);
          this.checkpoints = checkpoints; // .map(doc => doc.data()) as Checkpoint[];
          this.columnsToDisplay = [firstColumn];
          this.checkpoints.forEach((cp, i) => {
            const id = `cp${i}`;
            this.columnsToDisplay.push({
              id,
              name: cp.displayName || NONE_CHECKPOINT,
              type: cp.sleep ? 'checkpoint-type-sleep' : cp.selfcheck ? 'checkpoint-type-selfcheck' : '',
              distance: cp.distance?.toString() || ''
            });
          });
          this.firstHeader = this.columnsToDisplay.map(c => c.id);
          this.secondHeader = this.columnsToDisplay.map(c => 'dist-' + c.id);
          this.checkpoints$.next(this.checkpoints);
        });
      this.storage.watchBrevetProgress(brevetUid)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((checkpoint: Checkpoint) => {
          // FIXME: avoid self-assignment
          this.progress.data = this.progress.data ? this.progress.data : [];

          // console.log('got checkpoint', checkpoint);
          const checkpointIndex = this.checkpoints.findIndex(cp => cp.uid === checkpoint.uid);
          if (checkpointIndex === -1) {
            console.warn(`unknown checkpoint ${checkpoint.uid}`);
            return;
          }
          checkpoint.riders?.forEach(rider => {
            const known = this.progress.data.find(row => row.uid === rider.uid);
            const checkIn = Array.isArray(rider.time) ? rider.time[0] : null;
            if (known) {
              // console.log('known rider', rider);
              // a property with variable name: cp1, cp3, etc.
              // @ts-ignore
              known[`cp${checkpointIndex}`] = checkIn;
            } else {
              // console.log('new rider', rider);
              const row = {
                name: rider.name,
                code: rider.code,
                lastName: rider.lastName,
                uid: rider.uid,
                [`cp${checkpointIndex}`]: checkIn
              } as unknown as RiderCheckIn;
              this.progress.data.push(row);
            }
          });
          this.table?.renderRows();
/*
          const toExport = this.progress.data.map(row => {
            const newRow = {
              code: (this.riders.find(r => r.uid === row.uid) || {})['code'],
              name: row.name
            };
            for (const col in row) {
              // @ts-ignore
              const time = row[col];
              if (time instanceof Timestamp) {
                const hours = time.toDate().getHours()
                const minutes = time.toDate().getMinutes();
                // @ts-ignore
                newRow[col] = time.toDate().toString();
                //  (hours > 9 ? hours : "0" + hours) + ":" + (minutes > 9 ? minutes : "0" + minutes);
              }
            }
            return newRow;
          });
          // console.log('= brevet result export', JSON.stringify(toExport));
 */

          // this.dataSource.paginator = this.paginator;
        });
    });
    this.brevet$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(isNotNullOrUndefined))
      .subscribe((brevet: Brevet) => {
        this.titleService.setTitle(`Бревет ${brevet.name}`);
        this.brevet = brevet;
        this.formGroup.controls.name?.setValue(brevet.name);
        this.formGroup.controls.length?.setValue(brevet.length);
        this.formGroup.controls.mapUrl?.setValue(brevet.mapUrl);
        this.mapId = this.findMapId(brevet.mapUrl);
        this.formGroup.controls
          .startDate?.setValue(brevet.startDate ? brevet.startDate.toDate() : null);
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  get allowCheckIn(): boolean {
    return !!this.auth.user;
  }

  findMapId(url?: string): number {
    if (!url) {
      return 0;
    }
    const idSearch = url.match('/route/(\\d+)');
    if (idSearch && idSearch.length > 1) {
      return parseInt(idSearch[1], 10);
    }
    return 0;
  }

  updateMapUrl() {
    const control = this.formGroup.controls.mapUrl;
    if (control && control.valid) {
      const mapId = this.findMapId(control.value);
      // ignore URL updates if map ID hasn't changed
      if (mapId === this.findMapId(this.brevet?.mapUrl)) {
        return;
      }
      this.routeService.retrieve(mapId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(data => {
            if (this.brevet) {
              this.brevet.name = data.name;
              this.brevet.length = data.length;
            }

            this.formGroup.controls.name?.setValue(data.name);
            this.formGroup.controls.length?.setValue(data.length);

            if (data.checkpoints && data.checkpoints.length && this.brevet) {
              data.checkpoints.forEach(checkpoint => this.storage
                .createCheckpoint(this.brevet as Brevet,
                  new Checkpoint({
                    ...checkpoint,
                    // Convert the distance from meters to kilometers
                    distance: Math.round(checkpoint.distance / 1000)
                  } as RoutePoint)));
            }

            this.updateField('mapUrl');
          },
          error => {
            console.error(error);
            // switch back in case of retrieval error
            control.setValue(this.brevet?.mapUrl);
          });
    } else {
      // switch back if new value is invalid
      control?.setValue(this.brevet?.mapUrl);
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
        // @ts-ignore
        if (this.brevet[field] && this.brevet[field].seconds === value.seconds) {
          return;
        } else {
          // @ts-ignore
          this.brevet[field] = value;
        }
      } else {
        // @ts-ignore
        if (this.brevet[field] === control.value) {
          return;
        } else {
          // @ts-ignore
          this.brevet[field] = control.value;
        }
      }

      console.log(`= update ${field} with ${control.value}`);
      this.storage.updateBrevet(this.brevet)
        .then(() => {
          console.log(`= updated brevet ${this.brevet?.uid}`);
        })
        .catch(error => {
          console.error('brevet update has failed', error);
          this.snackBar.open(`Не удалось сохранить изменения. ${error.message}`,
           'Закрыть');
        });
    } else {
      // console.log(`= backup form ${field} from ${control.value} to ${this.rider[field].toDate()}`);
      // @ts-ignore
      control?.setValue(this.brevet[field] instanceof Timestamp ?
        // @ts-ignore
        this.brevet[field].toDate() :
        // @ts-ignore
        this.brevet[field]
      );
    }
  }

  addCheckpoint() {
    console.log('= add checkpoint');
    if (!this.brevet) {
      console.error('No brevet defined');
      return;
    }
    const checkpoint = new Checkpoint({name: 'Новый', distance: 0} as RoutePoint);
    this.storage.createCheckpoint(this.brevet, checkpoint).then(uid => {
      this.router.navigate(['brevet', this.brevet?.uid || NONE_BREVET, 'checkpoint', uid]);
    });
  }

  startScanner() {
    const dialogRef = this.dialog.open(ScannerDialogComponent, {
      minWidth: 'min(99vw, 600px)',
      maxHeight: '99vh',
    });
    // track every code coming from the scanner
    dialogRef.componentInstance.onSuccess
      .pipe(takeUntil(dialogRef.afterClosed()))
      .subscribe((barcode: Barcode) => this.storage
        .filterCheckpoints(this.brevet?.uid || NONE_BREVET,
          [{uid: barcode.code} as Checkpoint]).toPromise()
        .then(checkpoints => checkpoints.length ?
          this.queue.enqueueBarcode('riders', this.auth.user?.uid, barcode) :
          Promise.reject(new CheckpointNotFound('wrong checkpoint'))
        )
        .then(uid => console.log('= barcode created', uid))
        .catch(error => {
          if (error instanceof CheckpointNotFound) {
            this.snackBar.open('Неверный контрольный пункт',
              'Закрыть');
          } else if (error instanceof Offline) {
            this.snackBar.open('Нет интернета. Код записан в архив.',
              'Закрыть');
          } else {
            console.error('= barcode reporting has failed', error);
            this.snackBar.open(`Не удалось отправить код. ${error.message}`,
              'Закрыть');
          }
        }));
  }

  locateOnMap(): void {
    const dialogRef = this.dialog.open(MapboxLocationDialogComponent, {
      minWidth: 'min(99vw, 600px)',
      maxHeight: '99vh',
      data: {
        center: {
          lng: this.checkpoints[0].coordinates?.longitude,
          lat: this.checkpoints[0].coordinates?.latitude
        },
        checkpoints: this.checkpoints,
        brevetUid: this.brevet?.uid,
      }
    });
    dialogRef.afterClosed().toPromise()
      .then((uid: string) => uid ?
        this.queue.enqueueBarcode('riders',
          this.auth.user?.uid,
          new Barcode(undefined, uid, undefined)) :
        Promise.reject('Не указан КП'))
      .then(uid => {
        console.log('= record created', uid);
        this.snackBar.open('Координаты записаны',
          'Закрыть');
      })
      .catch(error => {
        if (error instanceof CheckpointNotFound) {
          this.snackBar.open('КП поблизости не найдено.',
            'Закрыть');
        } else if (error instanceof Offline) {
          this.snackBar.open('Нет интернета. Код записан в архив.',
            'Закрыть');
        } else {
          // fallback
          console.error('= location error', error);
          let message = error.message || error;
          if (message.includes('of undefined')) {
            message = 'КП поблизости не найдено.';
          }
          this.snackBar.open(message, 'Закрыть');
        }
      });
  }

  startImporting() {
    if (!this.auth.user?.strava) {
      this.strava.login(`${window.location.origin}/brevet/${this.brevet?.uid}`);
      return;
    }
    this.snackBar.open(`Поиск запущен`, 'Закрыть');
    // chain possible token refreshing
    Promise.resolve()
      .then(() => {
        if (tokenExpired(this.auth.user?.strava)) {
          console.log('= expired strava tokens');
          return this.strava.refreshToken();
        }
        return;
      })
      .then(() => console.log('= start importing'))
      .then(() => this.strava
        .searchActivities(this.brevet?.startDate.seconds, this.brevet?.endDate?.seconds));
  }
}
