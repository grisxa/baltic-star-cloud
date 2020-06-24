import {Component, EventEmitter, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {StorageService} from '../services/storage.service';
import {ScannerData} from '../models/scanner-data';
import {Barcode} from '../models/barcode';

@Component({
  selector: 'app-scanner-dialog',
  templateUrl: './scanner-dialog.component.html',
  styleUrls: ['./scanner-dialog.component.css']
})
export class ScannerDialogComponent {
  onSuccess = new EventEmitter<Barcode>();
  lastCode: string;

  constructor(public dialogRef: MatDialogRef<ScannerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ScannerData) { }

  scanSuccessHandler(code: string) {
    if (code === this.lastCode) {
      return;
    }
    this.lastCode = code;
    const barcode = new Barcode();
    const codeIndex = code.lastIndexOf('/');

    if (codeIndex !== -1) {
      barcode.code = code.substr(codeIndex + 1);
    } else {
      barcode.code = code;
    }
    if (!barcode.code) {
      return;
    }
    this.onSuccess.emit(barcode);
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
