import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
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
});
