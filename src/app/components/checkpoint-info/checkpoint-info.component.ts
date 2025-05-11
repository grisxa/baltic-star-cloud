import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {from, Observable, of, Subject} from 'rxjs';
import {Checkpoint, NONE_CHECKPOINT} from '../../models/checkpoint';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../../services/storage.service';
import {Barcode} from '../../models/barcode';
import {RiderCheckIn} from '../../models/rider-check-in';
import {filter, map, takeUntil} from 'rxjs/operators';
import {ScannerDialogComponent} from '../../scanner-dialog/scanner-dialog.component';
import {MapboxDialogComponent} from '../mapbox-dialog/mapbox-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSort} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {BarcodeQueueService} from '../../services/barcode-queue.service';
import {Offline} from '../../models/offline';
import {GeoPoint} from 'firebase/firestore';
import {isNotNullOrUndefined} from '../../utils';

@Component({
  selector: 'app-checkpoint-info',
  templateUrl: './checkpoint-info.component.html',
  styleUrls: ['./checkpoint-info.component.scss']
})
export class CheckpointInfoComponent implements OnInit, OnDestroy, AfterViewInit {
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

    this.route.paramMap
      .pipe(
        map(params => params.get('checkpointUid') as string),
        filter(checkpointUid => !!checkpointUid),
      )
      .subscribe((checkpointUid: string) => {
        this.url = window.location.origin + `/c/${checkpointUid}`;
        this.subscribeCheckpoint(checkpointUid);
        this.subscribeBarcodes(checkpointUid);
        this.subscribeCheckIns(checkpointUid);
      });
  }

  private subscribeCheckpoint(checkpointUid: string) {
    from(this.storage.getCheckpoint(checkpointUid))
      .pipe(takeUntil(this.unsubscribe$), filter(isNotNullOrUndefined))
      .subscribe((checkpoint: Checkpoint) => {
        this.titleService.setTitle(`${checkpoint.displayName} - Бревет ${checkpoint.brevet?.name}`);
        this.checkpoint = checkpoint;
        this.formGroup.controls.displayName?.setValue(checkpoint.displayName);
        this.formGroup.controls.distance?.setValue(checkpoint.distance);
        this.formGroup.controls.sleep?.setValue(checkpoint.sleep);
        this.formGroup.controls.selfcheck?.setValue(checkpoint.selfcheck);

        if (checkpoint.isClosed()) {
          setTimeout(() => {
            this.unsubscribe$.next();
            // checkpoint.checkIns may be not saved as of now
            if (checkpoint.checkIns) {
              this.riders.data = checkpoint.checkIns;
            }
            /*
            expect
              lastName: checkIn.lastName,
              in: checkIn.time[0],
              out: checkIn.time.length > 1 ? checkIn.time[checkIn.time.length - 1] : null,
             */
            }, 5000);
        }
      });
  }

  private subscribeBarcodes(checkpointUid: string) {
    this.storage.watchBarcodes('checkpoints', checkpointUid)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((codes: Barcode[]) => this.barcodes.data = codes);
  }
  private subscribeCheckIns(checkpointUid: string) {
    this.storage.watchCheckpointProgress(checkpointUid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((checkIns: RiderCheckIn[]) => {
        this.riders.data = checkIns.map((checkIn: RiderCheckIn) => ({
          ...checkIn,
          lastName: checkIn.lastName,
          in: checkIn.time[0],
          out: checkIn.time.length > 1 ? checkIn.time[checkIn.time.length - 1] : null,
        } as RiderCheckIn));
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
      // @ts-ignore
      this.checkpoint[field] = control.value;
      this.storage.updateCheckpoint(this.checkpoint)
        .catch(error => this.snackBar
          .open(`Не удалось сохранить изменения. ${error.message}`,
            'Закрыть'));
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
    this.router.navigate(['checkpoint', this.checkpoint?.uid || NONE_CHECKPOINT, 'addbarcode'])
      .catch(error => console.error('Navigation failed', error));
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
          .catch(error => {
            if (error instanceof Offline) {
              this.snackBar.open('Нет интернета. Код записан в архив.',
                'Закрыть');
            } else {
              console.error('= barcode reporting has failed', error);
              this.snackBar.open(`Не удалось отправить код. ${error.message}`,
                'Закрыть');
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
            .catch(error => this.snackBar
              .open(`Не удалось сохранить изменения. ${error.message}`,
                'Закрыть'));
        }
      });
  }


}
