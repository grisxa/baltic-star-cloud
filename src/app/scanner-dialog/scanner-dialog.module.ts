import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScannerDialogComponent} from './scanner-dialog.component';
import {ZXingScannerModule} from '@zxing/ngx-scanner';



@NgModule({
  declarations: [ScannerDialogComponent],
  imports: [
    CommonModule,
    ZXingScannerModule,
  ],
  exports: [ ScannerDialogComponent ],
  entryComponents: [ScannerDialogComponent]
})
export class ScannerDialogModule { }
