import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as firebase from 'firebase/app';
import {Observable, of, Subject} from 'rxjs';

import {Rider} from '../../models/rider';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../services/storage.service';
import {takeUntil} from 'rxjs/operators';
import Timestamp = firebase.firestore.Timestamp;
import {Barcode} from '../../models/barcode';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Title} from '@angular/platform-browser';


@Component({
  selector: 'app-rider-info',
  templateUrl: './rider-info.component.html',
  styleUrls: ['./rider-info.component.scss']
})
export class RiderInfoComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  private rider$: Observable<Rider> = of<Rider>({} as Rider);
  rider: Rider;
  url: string;
  formGroup: FormGroup;

  barcodes = new MatTableDataSource<Barcode>();
  barcodeColumnsToDisplay = ['time', 'code', 'message'];

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              public auth: AuthService,
              public dialog: MatDialog,
              private storage: StorageService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.titleService.setTitle('Участник');
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
        this.titleService.setTitle(`${rider.firstName} ${rider.lastName}`);
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
}
