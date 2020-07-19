import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrevetListItemComponent } from './brevet-list-item.component';

describe('BrevetListItemComponent', () => {
  let component: BrevetListItemComponent;
  let fixture: ComponentFixture<BrevetListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrevetListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
