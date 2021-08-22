import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {StorageService} from '../../services/storage.service';
import {AuthService} from '../../services/auth.service';
import {Observable, of, Subject} from 'rxjs';
import {Checkpoint} from '../../models/checkpoint';
import {FormControl, Validators} from '@angular/forms';
import firebase from 'firebase/app';
import {Barcode} from '../../models/barcode';
import {MatInput} from '@angular/material/input';
import {takeUntil} from 'rxjs/operators';
import Timestamp = firebase.firestore.Timestamp;

/**
 * Manual barcode filling
 */

@Component({
  selector: 'app-add-barcode',
  templateUrl: './add-barcode.component.html'
})
export class AddBarcodeComponent implements OnInit, OnDestroy {
  @ViewChild(MatInput) code?: MatInput;

  checkpoint$: Observable<Checkpoint> = of({} as Checkpoint);
  codeControl: FormControl;
  dateControl: FormControl;
  readonly unsubscribe$ = new Subject();
  readonly barcode: Barcode = new Barcode();
  private checkpoint?: Checkpoint;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private storage: StorageService,
              public auth: AuthService) {

    // connect the form to a barcode object
    this.codeControl = new FormControl(this.barcode.code, Validators.required);
    this.codeControl.valueChanges.subscribe(code => this.barcode.code = code);
    this.dateControl = new FormControl(this.barcode.time.toDate(), Validators.required);
    this.dateControl.valueChanges
      .subscribe((date: Date) => this.barcode.time = Timestamp.fromDate(date));
  }

  ngOnInit() {
    // go to the code input field
    setTimeout(() => this.code?.focus());

    // connect to possible checkpoint info updates
    this.route.paramMap.subscribe(params => {
      const checkpointUid = params.get('uid');
      if (!checkpointUid) {
        return;
      }
      this.checkpoint$ = this.storage.getBarcodeRoot(checkpointUid);
      this.checkpoint$.pipe(takeUntil(this.unsubscribe$))
        .subscribe(checkpoint => this.checkpoint = checkpoint);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  /**
   * Return to the previous page (a checkpoint info).
   */
  onCancel() {
    this.location.back();
  }

  /**
   * Validate the input and send to the storage.
   * Then return to the previous page (a checkpoint info).
   */
  onSave() {
    if (this.dateControl?.valid && this.codeControl?.valid) {
      this.storage.createBarcode('checkpoints',
        this.checkpoint?.uid, this.barcode, this.auth.user?.uid)
        .then(uid => this.location.back());
    }
    // TODO: highlight invalid field
  }
}
