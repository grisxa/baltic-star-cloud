import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, of, Subject} from 'rxjs';
import {Checkpoint, NONE_CHECKPOINT} from '../../models/checkpoint';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../../services/storage.service';
import {Barcode} from '../../models/barcode';
import {RiderCheckIn} from '../../models/rider-check-in';
import {takeUntil} from 'rxjs/operators';
import {ScannerDialogComponent} from '../../scanner-dialog/scanner-dialog.component';
import {MapboxDialogComponent} from '../mapbox-dialog/mapbox-dialog.component';
import firebase from 'firebase/app';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSort} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {BarcodeQueueService} from '../../services/barcode-queue.service';
import {Offline} from '../../models/offline';
import GeoPoint = firebase.firestore.GeoPoint;

@Component({
  selector: 'app-checkpoint-info',
  templateUrl: './checkpoint-info.component.html',
  styleUrls: ['./checkpoint-info.component.scss']
})
export class CheckpointInfoComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: true}) paginator?: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  checkpoint?: Checkpoint;
  url?: string;
  formGroup: FormGroup;

  barcodes = new MatTableDataSource<Barcode>();
  barcodeColumnsToDisplay = ['time', 'code', 'message'];
  riders = new MatTableDataSource<RiderCheckIn>();
  riderColumnsToDisplay = ['code', 'name', 'in', 'out'];

  private unsubscribe$ = new Subject();
  private checkpoint$: Observable<Checkpoint> = of({} as Checkpoint);

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              public dialog: MatDialog,
              private router: Router,
              private storage: StorageService,
              private queue: BarcodeQueueService,
              public auth: AuthService,
              private snackBar: MatSnackBar) {
    this.formGroup = new FormGroup({
      displayName: new FormControl('', Validators.required),
      distance: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
      sleep: new FormControl('', Validators.required),
      selfcheck: new FormControl('', Validators.required),
    });
  }

  // try sending old codes again
  @HostListener('window:online')
  onConnectionBack() {
    this.queue.repeatSending();
  }

  ngAfterViewInit() {
    this.riders.sort = this.sort;
    setTimeout( () => this.sort
      .sort({id: 'in', start: 'asc', disableClear: true}), 0);
  }

  ngOnInit() {
    this.titleService.setTitle('Контрольный пункт');
    this.barcodes.paginator = this.paginator || null;
    this.route.paramMap.subscribe(params => {
      const brevetUid = params.get('brevetUid');
      const checkpointUid = params.get('checkpointUid');
      if (!brevetUid || !checkpointUid) {
        return;
      }
      this.url = window.location.origin + `/c/${checkpointUid}`;
      this.checkpoint$ = this.storage.getCheckpoint(checkpointUid);
      this.storage.watchBarcodes('checkpoints', checkpointUid)
        .subscribe((codes: Barcode[]) => {
          console.log('= got barcodes', codes);
          this.barcodes.data = codes;
          // this.dataSource.paginator = this.paginator;
        });
      this.storage.watchCheckpointProgress(brevetUid, checkpointUid)
        .subscribe((checkIns: RiderCheckIn[]) => {
          console.log('got riders', checkIns);
          this.riders.data = checkIns.map((checkIn: RiderCheckIn) => ({
            ...checkIn,
            // TODO: rely on lastName presence (?) in the document
            lastName: checkIn.lastName || checkIn.name?.trim().split(/\s/).pop(),
            in: checkIn.time[0],
            out: checkIn.time.length > 1 ? checkIn.time[checkIn.time.length - 1] : null,
          } as RiderCheckIn));
          // this.dataSource.paginator = this.paginator;
        });
    });
    this.checkpoint$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((checkpoint: Checkpoint) => {
        // FIXME: triggers on a checkpoint deletion
        if (checkpoint === undefined) {
          return;
        }
        this.titleService.setTitle(`${checkpoint.displayName} - Бревет ${checkpoint.brevet?.name}`);
        this.checkpoint = checkpoint;
        this.formGroup.controls.displayName?.setValue(checkpoint.displayName);
        this.formGroup.controls.distance?.setValue(checkpoint.distance);
        this.formGroup.controls.sleep?.setValue(checkpoint.sleep);
        this.formGroup.controls.selfcheck?.setValue(checkpoint.selfcheck);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  updateField(field: string) {
    // FIXME: wait for initialization
    if (this.checkpoint === undefined) {
      return;
    }
    const control = this.formGroup.get(field);
    if (control && control.valid) {
      console.log('new value of', field, control.value);
      // @ts-ignore
      this.checkpoint[field] = control.value;
      this.storage.updateCheckpoint(this.checkpoint)
         .then(() => {
          console.log(`= updated checkpoint ${this.checkpoint?.uid}`);
        })
        .catch(error => {
          console.error('checkpoint update has failed', error);
          this.snackBar.open(`Не удалось сохранить изменения. ${error.message}`,
            'Закрыть', {duration: 5000});
        });
    } else {
      // @ts-ignore
      control?.setValue(this.checkpoint[field]);
    }
  }

  updateSleep(event: MatButtonToggleChange) {
    this.formGroup.controls.sleep?.setValue(event.source.checked);
    this.updateField('sleep');
  }

  updateSelfCheck(event: MatButtonToggleChange) {
    this.formGroup.controls.selfcheck?.setValue(event.source.checked);
    this.updateField('selfcheck');
  }
  addBarcode() {
    console.log('= add barcode');
    this.router.navigate(['checkpoint', this.checkpoint?.uid || NONE_CHECKPOINT, 'addbarcode']);
  }

  startScanner(): void {
    const dialogRef = this.dialog.open(ScannerDialogComponent, {
      width: '75vw'
    });
    dialogRef.componentInstance.onSuccess.pipe(
      takeUntil(dialogRef.afterClosed()))
      .subscribe((barcode: Barcode) => {
        if (!this.checkpoint) {
          console.error('No checkpoint defined');
          return;
        }
        this.queue.enqueueBarcode('checkpoints', this.checkpoint.uid, barcode)
          .then(uid => console.log('= barcode created', uid))
          .catch(error => {
            if (error instanceof Offline) {
              this.snackBar.open('Нет интернета. Код записан в архив.',
                'Закрыть', {duration: 5000});
            } else {
              console.error('= barcode reporting has failed', error);
              this.snackBar.open(`Не удалось отправить код. ${error.message}`,
                'Закрыть', {duration: 5000});
            }
          });
      });
  }

  showMap(): void {
    const dialogRef = this.dialog.open(MapboxDialogComponent, {
      width: '75vw',
      data: this.checkpoint?.coordinates
    });
    dialogRef.afterClosed()
      .subscribe(data => {
        if (!this.checkpoint) {
          console.error('No checkpoint defined');
          return;
        }
        if (data && data.latitude && data.longitude) {
          this.checkpoint.coordinates = new GeoPoint(data.latitude, data.longitude);
          this.storage.updateCheckpoint(this.checkpoint)
            .then(() => {
              console.log(`= updated checkpoint ${this.checkpoint?.uid}`);
            })
            .catch(error => {
              console.error('checkpoint update has failed', error);
              this.snackBar.open(`Не удалось сохранить изменения. ${error.message}`,
                'Закрыть', {duration: 5000});
            });
        }
      });
  }


}
