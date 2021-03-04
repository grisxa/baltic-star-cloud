import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from '../../app-routing.module';
import {BrevetArchiveComponent} from '../brevet-archive/brevet-archive.component';
import {BrevetListItemComponent} from './brevet-list-item/brevet-list-item.component';
import {BrevetListComponent} from './brevet-list.component';

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
    }).compileComponents();
  });

  beforeEach(() => {
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
