import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as firebase from 'firebase/app';
import * as geofirestore from 'geofirestore';
import {Observable, of, Subject} from 'rxjs';

import {Rider} from '../../models/rider';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import {takeUntil} from 'rxjs/operators';
import Timestamp = firebase.firestore.Timestamp;
import {ScannerDialogComponent} from '../../scanner-dialog/scanner-dialog.component';
import {Barcode} from '../../models/barcode';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import GeoPoint = firebase.firestore.GeoPoint;
import {Checkpoint} from '../../models/checkpoint';
import {LocationService} from '../../services/location.service';
import {CheckpointSearchDialogComponent} from '../checkpoint-search-dialog/checkpoint-search-dialog.component';


@Component({
  selector: 'app-rider-info',
  templateUrl: './rider-info.component.html',
  styleUrls: ['./rider-info.component.scss']
})
export class RiderInfoComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  private rider$: Observable<Rider> = of<Rider>({} as Rider);
  rider: Rider;
  geoCheckpoints: geofirestore.GeoCollectionReference;
  url: string;
  formGroup: FormGroup;

  barcodes = new MatTableDataSource<Barcode>();
  barcodeColumnsToDisplay = ['time', 'code', 'message'];

  constructor(private route: ActivatedRoute,
              public auth: AuthService,
              public dialog: MatDialog,
              private storage: StorageService,
              private location: LocationService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.geoCheckpoints = geofirestore
      .initializeApp(firebase.firestore())
      .collection('checkpoints');

    this.formGroup = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      signed: new FormControl(false, Validators.required),
      birthDate: new FormControl(new Date(), Validators.required)
    });
    this.route.paramMap.subscribe(params => {
      const riderUid = params.get('uid');
      this.rider$ = this.storage.getRider(riderUid);
      this.url = window.location.origin + '/r/' + riderUid;
      this.storage.watchBarcodes('riders', riderUid)
        .subscribe((codes: Barcode[]) => {
          console.log('= got barcodes', codes);
          this.barcodes.data = codes;
          // this.dataSource.paginator = this.paginator;
        });
    });
    this.rider$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(rider => {
        this.rider = rider;
        console.log('= rider found', rider);
        this.formGroup.get('firstName').setValue(rider.firstName);
        this.formGroup.get('lastName').setValue(rider.lastName);
        this.formGroup.get('country').setValue(rider.country);
        this.formGroup.get('code').setValue(rider.code);
        this.formGroup.get('city').setValue(rider.city);
        this.formGroup.get('birthDate').setValue(rider.birthDate ? rider.birthDate.toDate() : null);
      });
  }

  // release watchers
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  get isEditable(): boolean {
    return this.auth.isAdmin ||
      (this.auth.user && this.rider && this.auth.user.uid === this.rider.owner);
  }

  isLocationAvailable(): boolean {
    return !!navigator.geolocation;
  }

  updateField(field: string) {
    const control = this.formGroup.get(field);
    if (this.rider === undefined) {
      return;
    }
    if (control && control.valid) {
      // check if the field needs updating
      if (control.value instanceof Date) {
        const value = Timestamp.fromDate(control.value);
        if (this.rider[field] && this.rider[field].seconds === value.seconds) {
          return;
        } else {
          this.rider[field] = value;
        }
      } else {
        if (this.rider[field] === control.value) {
          return;
        } else {
          this.rider[field] = control.value;
        }
      }

      console.log(`= update ${field} with ${control.value}`);
      if (field === 'firstName' || field === 'lastName') {
        this.rider.displayName = `${this.rider.firstName} ${this.rider.lastName}`;
      }
      this.storage.updateRider(this.rider)
        .then(() => {
          console.log(`= updated rider ${this.rider.uid}`);
        })
        .catch(error => {
          console.error('rider update has failed', error);
          this.snackBar.open(`Не удалось сохранить изменения. ${error.message}`,
            'Закрыть', {duration: 5000});
        });
    } else {
      // console.log(`= backup form ${field} from ${control.value} to ${this.rider[field].toDate()}`);
      control.setValue(this.rider[field] instanceof Timestamp ?
        this.rider[field].toDate() :
        this.rider[field]
      );
    }
  }

  startScanner(): void {
    const dialogRef = this.dialog.open(ScannerDialogComponent, {
      width: '75vw',
      data: {rider: this.rider.uid, auth: this.auth.user.uid}
    });
    dialogRef.componentInstance.onSuccess.pipe(
      takeUntil(dialogRef.afterClosed()))
      .subscribe((barcode: Barcode) => {
        this.storage.createBarcode('riders',
          this.rider.uid, barcode, this.auth.user.uid)
          .then(uid => console.log('= barcode created', uid))
          .catch(error => {
            console.error('= barcode reporting has failed', error);
            this.snackBar.open(`Не удалось отправить код. ${error.message}`,
              'Закрыть', {duration: 5000});
          });
      });
  }
  locate(): void {
    this.location.get()
      .then((position: Position) => {
        const coordinates = new GeoPoint(position.coords.latitude, position.coords.longitude);

        const query = this.geoCheckpoints
          .near({ center: coordinates, radius: 1.2 });

        return query.get();
      })
      .then(snapshot => snapshot.docs.map(doc => ({...doc.data(), distance: doc.distance} as Checkpoint)))
      // filter checkpoints by brevet's date
      .then(checkpoints => checkpoints.filter(checkpoint => Checkpoint.prototype.isOnline.call(checkpoint, Timestamp.now())))
      // sort them by the distance, closest first
      .then(checkpoints => checkpoints.sort((a, b) => a.distance - b.distance))
      .then(checkpoints => {
        // offer selecting among several controls
        if (checkpoints.length > 1) {
          const dialogRef = this.dialog.open(CheckpointSearchDialogComponent, {
            data: checkpoints
          });
          return dialogRef.afterClosed().toPromise();
        } else {
          // or just return the first
          return Promise.resolve(checkpoints[0].uid);
        }
      })
      .then((uid: string) => uid ?
        this.storage.createBarcode('riders',
          this.rider.uid,
          new Barcode(undefined, uid, undefined),
          this.auth.user.uid) :
        undefined)
      .then(uid => console.log('= record created', uid))
      .catch(error => {
        console.error('= location error', error);
        let message = error.message || error;
        if (message.includes('of undefined')) {
          message = 'КП поблизости не найдено.';
        }
        this.snackBar.open(message, 'Закрыть', {duration: 5000});
      });
  }
}
