import {Component, EventEmitter} from '@angular/core';
import {Barcode} from '../models/barcode';
import {BarcodeFormat} from '@zxing/library';
import {ToneService} from '../services/tone.service';

@Component({
  selector: 'app-scanner-dialog',
  templateUrl: './scanner-dialog.component.html',
  styleUrls: ['./scanner-dialog.component.css']
})
export class ScannerDialogComponent {
  onSuccess = new EventEmitter<Barcode>();
  lastCode: string;
  acceptedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];

  constructor(private toneService: ToneService) {
  }

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
    this.toneService.make(3200, 80);
    this.onSuccess.emit(barcode);
  }
}
