import {Component, EventEmitter} from '@angular/core';
import {Barcode} from '../models/barcode';
import {BarcodeFormat} from '@zxing/library';
import {ToneService} from '../services/tone.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BehaviorSubject} from 'rxjs';
import {SettingService} from '../services/setting.service';

@Component({
  selector: 'app-scanner-dialog',
  templateUrl: './scanner-dialog.component.html',
  styleUrls: ['./scanner-dialog.component.scss']
})
export class ScannerDialogComponent {
  onSuccess = new EventEmitter<Barcode>();
  lastCode: string;
  acceptedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];

  hasDevices: boolean;
  hasPermission: boolean;

  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;
  currentDeviceId = '';

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);

  constructor(
    private toneService: ToneService,
    private settings: SettingService,
    private snackBar: MatSnackBar) {
  }

  onHasPermission(allowed: boolean) {
    this.hasPermission = allowed;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);

    const selected = this.settings.getValue('camera_id');
    if (selected) {
      const device = devices.find(x => x.deviceId === selected);
      this.currentDevice = device || null;
      this.currentDeviceId = selected;
    }
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice = device || null;
    this.settings.setValue('camera_id', selected);
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
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
    this.snackBar.open(`Прочитан код ${barcode.code}`,
      'Закрыть', {duration: 5000});
    this.onSuccess.emit(barcode);
  }
}
