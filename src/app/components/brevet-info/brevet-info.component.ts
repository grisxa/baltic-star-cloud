import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {MatSort} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';

import {from, Observable, of, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {Brevet, NONE_BREVET} from '../../models/brevet';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import {Checkpoint, NONE_CHECKPOINT} from '../../models/checkpoint';
import {RiderCheckIn} from '../../models/rider-check-in';
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
import {StravaActivityService, tokenExpired} from '../../services/strava-activity.service';
import {TrackNotFound} from '../../models/track-not-found';
import {StravaTokens} from 'src/app/models/strava-tokens';
import {Timestamp} from 'firebase/firestore';
import {getFunctions, httpsCallable} from '@angular/fire/functions';

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

  checkpoints: Checkpoint[] = [];

  // FIXME: consider pre-defined
  // dynamic column names like cp, cp3 (no pre-defined count)
  progress = new MatTableDataSource<RiderCheckIn>();
  columnsToDisplay: ProgressColumn[] = [firstColumn];
  firstHeader = [firstColumn.id];
  secondHeader = ['dist-' + firstColumn.id];

  geoJSON = {};

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
              private strava: StravaActivityService,
              private snackBar: MatSnackBar) {
    this.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      length: new FormControl(0, [Validators.required, Validators.pattern('[0-9]+')]),
      startDate: new FormControl(new Date(), Validators.required),
      mapUrl: new FormControl('', [Validators.required, Validators.pattern('https?://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+')]),
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

    this.route.paramMap.subscribe(params => {
      const brevetUid = params.get('uid');
      if (!brevetUid) {
        return;
      }

      if (this.settings.getValue('strava-import')) {
        this.startImporting(brevetUid);
      }

      this.brevet$ = from(this.storage.getBrevet(brevetUid))
        .pipe(filter(isNotNullOrUndefined));

    });
    this.brevet$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(isNotNullOrUndefined))
      .subscribe((brevet: Brevet) => {
        this.titleService.setTitle(`Бревет ${brevet.name}`);
        this.brevet = brevet;

        if (!brevet.hasFinished()) {
          // cache checkpoints for a quick search
          this.storage.listCheckpoints(brevet.uid)
            .then((checkpoints: Checkpoint[]) => console.log(checkpoints.length + ' checkpoints in a cache'));
        }
        if (brevet.hasStarted()) {
          // No checkpoint changes expected after the brevet starts
          this.checkpoints = brevet.checkpoints || [];
          // inject the brevet uid
          this.checkpoints.forEach(cp => cp.brevet = {uid: brevet.uid} as Brevet);
          this.onCheckpointsReady();
        } else {
          this.storage.watchCheckpoints(brevet.uid)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((checkpoints: Checkpoint[]) => {
              this.checkpoints = checkpoints;
              this.onCheckpointsReady();
            });
        }

        if (brevet.isOnline(Timestamp.now())) {
          this.storage.watchBrevetProgress(brevet.uid)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((checkpoint: Checkpoint) => {
            // NOTE: Keep replacing the data to trigger redraw
            this.progress.data = this.progress.data || [];

            const checkpointIndex = this.checkpoints.findIndex(cp => cp.uid === checkpoint.uid);
            if (checkpointIndex === -1) {
              console.warn(`unknown checkpoint ${checkpoint.uid}`);
              return;
            }
            checkpoint.riders?.forEach(rider => {
              const known = this.progress.data.find(row => row.uid === rider.uid);
              const checkIn = Array.isArray(rider.time) ? checkpointIndex === 0 ? rider.time[rider.time.length - 1] : rider.time[0] : null;
              if (known) {
                // a property with variable name: cp1, cp3, etc.
                // @ts-ignore
                known[`cp${checkpointIndex}`] = checkIn;
              } else {
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
          });
        } else {
          // After the brevet ends switch to the static data
          Object.entries(brevet.results || {}).forEach(([key, rider]) => {
            const [firstName = '', lastName = ''] = rider.name?.trim().split(/\s+/) ?? [];
            const row: {[key: string]: any} = {
              name: `${lastName} ${firstName}`,
              code: rider.code,
              lastName: rider.lastName || lastName || firstName,
              uid: rider.uid
            };
            rider.checkins.forEach((time: Timestamp, i: number) => row[`cp${i}`] = time);
            this.progress.data.push(row as RiderCheckIn);
          });
          this.table?.renderRows();
          this.progress.sort = this.sort;
        }

        if (brevet.track) {
          this.geoJSON = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: brevet.track.map(point => [
                point.coordinates?.longitude,
                point.coordinates?.latitude])
            }
          };
        }
        this.formGroup.controls.name?.setValue(brevet.name);
        this.formGroup.controls.length?.setValue(brevet.length);
        this.formGroup.controls.mapUrl?.setValue(brevet.mapUrl);
        this.mapId = this.findMapId(brevet.mapUrl);
        this.formGroup.controls
          .startDate?.setValue(brevet.startDate ? brevet.startDate.toDate() : null);
      });
  }

  onCheckpointsReady() {
    // the rider name column
    this.columnsToDisplay = [firstColumn];
    this.checkpoints.forEach((cp, i) => {
      const id = `cp${i}`;
      this.columnsToDisplay.push({
        id,
        name: cp.displayName || cp.name || NONE_CHECKPOINT,
        type: cp.sleep ? 'checkpoint-type-sleep' : cp.selfcheck ? 'checkpoint-type-selfcheck' : '',
        distance: cp.distance?.toString() || ''
      });
    });
    // the checkpoint name row
    this.firstHeader = this.columnsToDisplay.map(c => c.id);
    // the checkpoint distance row (km)
    this.secondHeader = this.columnsToDisplay.map(c => 'dist-' + c.id);
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  get allowCheckIn(): boolean {
    return !!this.auth.user && this.checkpoints.length > 0;
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

      this.storage.updateBrevet(this.brevet)
        .catch(error => this.snackBar
          .open(`Не удалось сохранить изменения. ${error.message}`,
           'Закрыть'));
    } else {
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
    if (!this.brevet) {
      console.error('No brevet defined');
      return;
    }
    const checkpoint = new Checkpoint({name: 'Новый', distance: 0} as RoutePoint);
    this.storage.createCheckpoint(this.brevet, checkpoint)
      .then(uid => this.router
        .navigate(['brevet', this.brevet?.uid || NONE_BREVET, 'checkpoint', uid])
        .catch(error => console.error('Navigation failed', error)));
  }

  importCheckpoints() {
    this.snackBar.open(`Импорт запущен`, 'Закрыть');
    const createCheckpoints = httpsCallable(getFunctions(), 'createCheckpoints');
    return createCheckpoints({brevetUid: this.brevet?.uid})
      .then((result) => result.data);
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
          [{uid: barcode.code} as Checkpoint])
        .then((checkpoints: Checkpoint[]) => checkpoints.length ?
          this.queue.enqueueBarcode('riders', this.auth.user?.uid, barcode) :
          Promise.reject(new CheckpointNotFound('wrong checkpoint'))
        )
        .catch((error: any) => {
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
        geoJSON: this.geoJSON,
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
      .then(uid => this.snackBar.open('Координаты записаны',
          'Закрыть')
      )
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

  startImporting(brevetUid?: string) {
    let tokens: StravaTokens = this.settings.getValue('strava') || this.auth.user?.strava;

    if (this.settings.getValue('strava-import') && !tokens) {
      console.error('Can\'t get Strava tokens');
      this.settings.removeKey('strava-import');
      return;
    }

    if (!tokens) {
      this.settings.setValue('strava-import', true);
      this.strava.login(`/brevet/${this.brevet?.uid}`);
      return;
    }
    this.settings.removeKey('strava-import');

    this.snackBar.open(`Поиск запущен`, 'Закрыть');
    // chain possible token refreshing
    Promise.resolve()
      .then(() => (tokenExpired(tokens) && this.strava.refreshToken(tokens)) || tokens)
      .then((newTokens: StravaTokens) => tokens = newTokens)
      .then(() => this.strava
        .searchActivities(brevetUid || this.brevet?.uid, this.auth.user?.uid, tokens))
      .then((count: number) => {
        this.snackBar.open(`Добавлено ${count} отметок`,
          'Закрыть');
      })
      .catch(error => {
        console.error('strava import error', error);
        if (error instanceof TrackNotFound) {
          this.snackBar.open(`Трек не найден. ${error.message}`,
            'Закрыть');
        } else {
          this.snackBar.open(`Ошибка импорта. ${error.message}`,
            'Закрыть');
        }
      })
      .finally(() => {
        // Cleanup temporary Strava access (optional)
        this.settings.removeKey('strava');

        // Revoke authorization
        if (this.auth.user?.stravaRevoke) {
          this.strava.logout(tokens.access_token)
            .catch(error => console.error('Strava de-authorization error', error.message));
        }
      });
  }

  uploadTrack(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedFile: File | undefined = inputElement?.files?.[0];
    if (!selectedFile) {
      this.snackBar.open(`Файл не выбран`, 'Закрыть');
      return;
    }

    this.snackBar.open(`Загрузка запущена`, 'Закрыть');

    const uploadTrack = httpsCallable(getFunctions(), 'uploadTrack');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    })
    .then(content => uploadTrack({brevetUid: this.brevet?.uid, riderUid: this.auth.user?.uid, track: content}))
      .then((result) => result.data)
      .then((data: any) => {
        if (data.error === 404 || data.error === 400) {
          // TODO: update error types
          throw new Error(data.message);
        }
        return data.message;
      })
      .then((count: number) => {
        this.snackBar.open(`Добавлено ${count} отметок`,
          'Закрыть');
      })
      .catch(error => {
        console.error('track import error', error);
        this.snackBar.open(`Ошибка импорта. ${error.message}`,
          'Закрыть');
      });
  }

  saveResults() {
    this.snackBar.open(`Запись запущена`, 'Закрыть');

    const save = httpsCallable(getFunctions(), 'saveResults');
    return save({brevetUid: this.brevet?.uid})
      .then((result) => result.data)
      .then(reply => {
        this.snackBar.open(`Запись завершена ${reply}`,
          'Закрыть');
      })
      .catch(error => {
        console.error('result saving error', error);
      });
  }
}
