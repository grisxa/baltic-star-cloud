import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatListModule} from '@angular/material/list';

import {AppRoutingModule} from '../../app-routing.module';
import {BrevetListItemComponent} from './brevet-list-item/brevet-list-item.component';
import {BrevetListComponent} from './brevet-list.component';

describe('BrevetListComponent', () => {
  let component: BrevetListComponent;
  let fixture: ComponentFixture<BrevetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrevetListComponent, BrevetListItemComponent],
      imports: [
        AppRoutingModule,
        MatListModule,
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
