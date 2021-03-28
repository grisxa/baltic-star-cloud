import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {MapboxDialogComponent} from './mapbox-dialog.component';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {AuthService} from '../../services/auth.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

class MockAuthService {
}


describe('MapboxDialogComponent', () => {
  let component: MapboxDialogComponent;
  let fixture: ComponentFixture<MapboxDialogComponent>;

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
      declarations: [MapboxDialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
