import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable, of} from 'rxjs';
import {Brevet, BrevetOptions} from '../../models/brevet';
import {CloudFirestoreService} from '../../services/storage/cloud-firestore.service';
import {DateTimePickerComponent} from '../date-time-picker/date-time-picker.component';
import {LoadingPlugComponent} from '../loading-plug/loading-plug.component';

import {BrevetEditComponent} from './brevet-edit.component';

class MockStorageService {
  getBrevet(uid: string): Observable<Brevet> {
    return of(new Brevet('Горьковский', {
      uid: '4',
      length: 200,
      startDate: new Date('2020-09-26 06:00:00 GMT')
    } as BrevetOptions));
  }
}

describe('BrevetEditComponent', () => {
  let component: BrevetEditComponent;
  let fixture: ComponentFixture<BrevetEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrevetEditComponent, LoadingPlugComponent, DateTimePickerComponent],
      imports: [
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatNativeDateModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      providers: [
        {provide: CloudFirestoreService, useClass: MockStorageService},
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
