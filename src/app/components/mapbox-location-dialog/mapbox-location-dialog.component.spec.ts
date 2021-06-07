import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {MapboxLocationDialogComponent} from './mapbox-location-dialog.component';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {AuthService} from '../../services/auth.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {StorageService} from '../../services/storage.service';
import {MatSelectModule} from '@angular/material/select';

class MockAuthService {
}
class MockStorageService {
}

describe('MapboxLocationDialogComponent', () => {
  let component: MapboxLocationDialogComponent;
  let fixture: ComponentFixture<MapboxLocationDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: AuthService, useClass: MockAuthService},
        {provide: StorageService, useClass: MockStorageService},
      ],
      declarations: [MapboxLocationDialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
