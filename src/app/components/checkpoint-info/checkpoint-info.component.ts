import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';

import {Checkpoint} from '../../models/checkpoint';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../../services/storage.service';
import {Barcode} from '../../models/barcode';
import {RiderCheckIn} from '../../models/rider-check-in';
import {takeUntil, tap} from 'rxjs/operators';
import {ScannerDialogComponent} from '../../scanner-dialog/scanner-dialog.component';
import {MapboxDialogComponent} from '../mapbox-dialog/mapbox-dialog.component';
import * as firebase from 'firebase/app';
import GeoPoint = firebase.firestore.GeoPoint;
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkpoint-info',
  templateUrl: './checkpoint-info.component.html',
  styleUrls: ['./checkpoint-info.component.scss']
})
export class CheckpointInfoComponent implements OnInit {
  private unsubscribe$ = new Subject();
  private checkpoint$: Observable<Checkpoint>;

  checkpoint: Checkpoint;
  url: string;
  formGroup: FormGroup;

  barcodes = new MatTableDataSource<Barcode>();
  barcodeColumnsToDisplay = ['time', 'code', 'message'];
  riders = new MatTableDataSource<RiderCheckIn>();
  riderColumnsToDisplay = ['name', 'in', 'out'];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private route: ActivatedRoute,
              public dialog: MatDialog,
              private router: Router,
              private storage: StorageService,
              public auth: AuthService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.barcodes.paginator = this.paginator;
    this.formGroup = new FormGroup({
      displayName: new FormControl('', Validators.required),
      distance: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
    });
    this.route.paramMap.subscribe(params => {
      const brevetUid = params.get('brevetUid');
      const checkpointUid = params.get('checkpointUid');
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
        this.checkpoint = checkpoint;
        this.formGroup.get('displayName').setValue(checkpoint.displayName);
        this.formGroup.get('distance').setValue(checkpoint.distance);
      });
  }

  updateField(field: string) {
    // FIXME: wait for initialization
    if (this.checkpoint === undefined) {
      return;
    }
    const control = this.formGroup.get(field);
    if (control && control.valid) {
      console.log('new value of', field, control.value);
      this.checkpoint[field] = control.value;
      this.storage.updateCheckpoint(this.checkpoint)
         .then(() => {
          console.log(`= updated checkpoint ${this.checkpoint.uid}`);
        })
        .catch(error => {
          console.error('brevet update has failed', error);
          this.snackBar.open(`Не удалось сохранить изменения. ${error.message}`,
            'Закрыть', {duration: 5000});
        });
    } else {
      control.setValue(this.checkpoint[field]);
    }
  }

  addBarcode() {
    console.log('= add barcode');
    this.router.navigate(['checkpoint', this.checkpoint.uid, 'addbarcode']);
  }

  startScanner(): void {
    const dialogRef = this.dialog.open(ScannerDialogComponent, {
      width: '75vw',
      data: {checkpoint: this.checkpoint.uid, auth: this.auth.user.uid}
    });
    dialogRef.componentInstance.onSuccess.pipe(
      takeUntil(dialogRef.afterClosed()))
      .subscribe((barcode: Barcode) => {
        this.storage.createBarcode('checkpoints',
          this.checkpoint.uid, barcode, this.auth.user.uid)
          .then(uid => console.log('= barcode created', uid));
      });
  }

  showMap(): void {
    const dialogRef = this.dialog.open(MapboxDialogComponent, {
      width: '75vw',
      data: this.checkpoint.coordinates
    });
    dialogRef.afterClosed()
      .subscribe(data => {
        if (data && data.latitude && data.longitude) {
          this.checkpoint.coordinates = new GeoPoint(data.latitude, data.longitude);
          this.storage.updateCheckpoint(this.checkpoint);
        }
      });
  }


}
