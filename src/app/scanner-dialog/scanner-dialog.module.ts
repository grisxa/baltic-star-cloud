import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScannerDialogComponent} from './scanner-dialog.component';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';


@NgModule({
  declarations: [ScannerDialogComponent],
  imports: [
    CommonModule,
    ZXingScannerModule,
    MatButtonModule,
    MatDialogModule,
  ],
  exports: [ ScannerDialogComponent ],
  entryComponents: [ScannerDialogComponent]
})
export class ScannerDialogModule { }
