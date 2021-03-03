import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatListModule} from '@angular/material/list';

import {AppRoutingModule} from '../../../app-routing.module';
import {BrevetListItemComponent} from './brevet-list-item.component';

describe('BrevetListItemComponent', () => {
  let component: BrevetListItemComponent;
  let fixture: ComponentFixture<BrevetListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrevetListItemComponent],
      imports: [
        AppRoutingModule,
        MatListModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
