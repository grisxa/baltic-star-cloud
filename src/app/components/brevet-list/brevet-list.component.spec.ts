import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';

import {AppRoutingModule} from '../../app-routing.module';
import {Brevet, BrevetOptions} from '../../models/brevet';
import {CloudFirestoreService} from '../../services/storage/cloud-firestore.service';
import {BrevetArchiveComponent} from '../brevet-archive/brevet-archive.component';
import {BrevetListItemComponent} from './brevet-list-item/brevet-list-item.component';
import {BrevetListComponent} from './brevet-list.component';

class MockStorageService {
  listBrevets() {
    return of([
      new Brevet('Горьковский', {
        uid: '4',
        length: 200,
        startDate: new Date('2020-09-26 06:00:00 GMT')
      } as BrevetOptions),
      new Brevet('Пушкинский', {
        uid: '1',
        length: 200,
        startDate: new Date('2021-06-19 06:00:00 GMT'),
        endDate: new Date('2021-06-19 19:30:00 GMT')
      } as BrevetOptions),
      new Brevet('Онего', {
        uid: '2',
        length: 600,
        startDate: new Date('2021-06-26 05:00:00 GMT')
      } as BrevetOptions),
      new Brevet('Военный', {
        uid: '3',
        length: 402,
        startDate: new Date('2021-07-03 05:00:00 GMT')
      } as BrevetOptions),
    ]);
  }
}


describe('BrevetListComponent', () => {
  let component: BrevetListComponent;
  let fixture: ComponentFixture<BrevetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrevetArchiveComponent, BrevetListComponent, BrevetListItemComponent],
      imports: [
        AppRoutingModule,
        MatExpansionModule,
        MatListModule,
        NoopAnimationsModule,
      ],
      providers: [
        {provide: CloudFirestoreService, useClass: MockStorageService},
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    // the New Year of 2021
    spyOn(Date, 'now').and.returnValue(1609448400000);

    fixture = TestBed.createComponent(BrevetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an old brevet list', () => {

    const archive = fixture.debugElement
      .query(By.css('app-brevet-archive'));
    expect(archive).not.toBeNull();
  });

  it('should hide an empty old brevet list', () => {
    component.oldBrevets = [];
    fixture.detectChanges();

    const archive = fixture.debugElement
      .query(By.css('app-brevet-archive'));
    expect(archive).toBeNull();
  });

  it('should list upcoming brevets', () => {
    const list = fixture.debugElement
      .queryAll(By.css('app-brevet-list-item'));
    expect(list.length).toEqual(4);
  });

  it('should not list brevets if nothing has been planned', () => {
    component.newBrevets = [];
    component.oldBrevets = [];
    fixture.detectChanges();

    const list = fixture.debugElement
      .queryAll(By.css('app-brevet-list-item'));
    expect(list.length).toEqual(0);
  });

});
