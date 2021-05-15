import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {MapboxLocationDialogComponent} from './mapbox-location-dialog.component';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {AuthService} from '../../services/auth.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

class MockAuthService {
}


describe('MapboxDialogComponent', () => {
  let component: MapboxLocationDialogComponent;
  let fixture: ComponentFixture<MapboxLocationDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: AuthService, useClass: MockAuthService},
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
