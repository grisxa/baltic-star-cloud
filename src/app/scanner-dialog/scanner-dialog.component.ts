import {Component, EventEmitter} from '@angular/core';
import {Barcode} from '../models/barcode';
import {BarcodeFormat} from '@zxing/library';
import {ToneService} from '../services/tone.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SettingService} from '../services/setting.service';
import {cutOffUrl, findRearCamera} from './scanner-utils';

@Component({
  selector: 'app-scanner-dialog',
  templateUrl: './scanner-dialog.component.html',
  styleUrls: ['./scanner-dialog.component.scss']
})
export class ScannerDialogComponent {
  onSuccess = new EventEmitter<Barcode>();
  lastCode: string;
  acceptedFormats: BarcodeFormat[] = [];

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo = null;
  currentDeviceId = '';

  constructor(
    private toneService: ToneService,
    private settings: SettingService,
    private snackBar: MatSnackBar) {
  }

  setCamera(id: string) {
    const device = this.availableDevices.find(camera => camera.deviceId === id);
    this.currentDevice = device || null;
    this.acceptedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;

    const selected = this.settings.getValue('camera_id') || findRearCamera(devices);
    this.currentDeviceId = selected;
    this.setCamera(selected);
  }

  onDeviceSelectChange(selected: string) {
    this.setCamera(selected);
    this.settings.setValue('camera_id', selected);
  }

  scanSuccessHandler(code: string) {
    if (code === this.lastCode) {
      return;
    }
    this.lastCode = code;
    const barcode = new Barcode();
    const codeIndex = code.lastIndexOf('/');

    barcode.code = cutOffUrl(code);
    if (!barcode.code) {
      return;
    }
    this.toneService.make(3200, 80);
    this.snackBar.open(`Прочитан код ${barcode.code}`,
      'Закрыть', {duration: 5000});
    this.onSuccess.emit(barcode);
  }
}
