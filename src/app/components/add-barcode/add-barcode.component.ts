import {Component, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {StorageService} from '../../services/storage.service';
import {AuthService} from '../../services/auth.service';
import {Observable} from 'rxjs';
import {Checkpoint} from '../../models/checkpoint';
import {FormControl, Validators} from '@angular/forms';
import * as firebase from 'firebase/app';
import {Barcode} from '../../models/barcode';
import Timestamp = firebase.firestore.Timestamp;
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'app-add-barcode',
  templateUrl: './add-barcode.component.html',
  styleUrls: ['./add-barcode.component.css']
})
export class AddBarcodeComponent implements OnInit {
  @ViewChild(MatInput) code: MatInput;

  checkpoint$: Observable<Checkpoint>;
  private checkpoint: Checkpoint;
  codeControl: FormControl;
  dateControl: FormControl;
  private barcode: Barcode;

  constructor(private route: ActivatedRoute, private location: Location, private storage: StorageService, public auth: AuthService) {
  }

  ngOnInit() {
    setTimeout(() => this.code.focus());

    this.barcode = new Barcode();
    console.log('= init', this.barcode);
    this.codeControl = new FormControl(this.barcode.code, Validators.required);
    this.codeControl.valueChanges.subscribe(code => this.barcode.code = code);
    this.dateControl = new FormControl(this.barcode.time.toDate(), Validators.required);
    this.dateControl.valueChanges.subscribe((date: Date) => this.barcode.time = Timestamp.fromDate(date));

    this.route.paramMap.subscribe(params => {
      const checkpointUid = params.get('uid');
      this.checkpoint$ = this.storage.getBarcodeRoot(checkpointUid).valueChanges();
      this.checkpoint$.subscribe(checkpoint => this.checkpoint = checkpoint);
    });
  }

  onCancel() {
    this.location.back();
  }

  onSave() {
    console.log('= save');
    if (this.dateControl.valid && this.codeControl.valid) {
      this.storage.createBarcode('checkpoints',
        this.checkpoint.uid, this.barcode, this.auth.user.uid)
        .then(uid => this.location.back());
    }
    // TODO: highlight invalid field
  }
}
