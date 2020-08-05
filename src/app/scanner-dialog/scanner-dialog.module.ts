import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScannerDialogComponent} from './scanner-dialog.component';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';


@NgModule({
  declarations: [ScannerDialogComponent],
  imports: [
    CommonModule,
    ZXingScannerModule,
    MatButtonModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  exports: [ ScannerDialogComponent ],
  entryComponents: [ScannerDialogComponent]
})
export class ScannerDialogModule { }
