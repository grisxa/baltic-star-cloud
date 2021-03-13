import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatListModule} from '@angular/material/list';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable, of} from 'rxjs';
import {Brevet, BrevetOptions} from '../../models/brevet';
import {CloudFirestoreService} from '../../services/storage/cloud-firestore.service';
import {LoadingPlugComponent} from '../loading-plug/loading-plug.component';

import {BrevetInfoComponent} from './brevet-info.component';

class MockStorageService {
  getBrevet(uid: string): Observable<Brevet> {
    return of(new Brevet('Горьковский', {
      uid: '4',
      length: 200,
      startDate: new Date('2020-09-26 06:00:00 GMT')
    } as BrevetOptions));
  }
}

describe('BrevetInfoComponent', () => {
  let component: BrevetInfoComponent;
  let fixture: ComponentFixture<BrevetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrevetInfoComponent,LoadingPlugComponent],
      imports: [
        MatListModule,
        RouterTestingModule,
      ],
      providers: [
        {provide: CloudFirestoreService, useClass: MockStorageService},
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a mocked Brevet object', () => {
    expect(component.brevet.uid).toEqual('4');
  });
});
