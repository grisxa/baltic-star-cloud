import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ScannerDialogComponent} from './scanner-dialog.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('ScannerDialogComponent', () => {
  let component: ScannerDialogComponent;
  let fixture: ComponentFixture<ScannerDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
        ZXingScannerModule
      ],
      declarations: [ScannerDialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
