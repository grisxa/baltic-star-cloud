import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckpointSearchDialogComponent } from './checkpoint-search-dialog.component';

describe('CheckpointSearchDialogComponent', () => {
  let component: CheckpointSearchDialogComponent;
  let fixture: ComponentFixture<CheckpointSearchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckpointSearchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckpointSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
