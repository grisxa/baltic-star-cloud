import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckpointListItemComponent } from './checkpoint-list-item.component';

describe('CheckpointListItemComponent', () => {
  let component: CheckpointListItemComponent;
  let fixture: ComponentFixture<CheckpointListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckpointListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckpointListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
