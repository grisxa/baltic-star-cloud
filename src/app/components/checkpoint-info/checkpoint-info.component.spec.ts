import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckpointInfoComponent } from './checkpoint-info.component';

xdescribe('CheckpointInfoComponent', () => {
  let component: CheckpointInfoComponent;
  let fixture: ComponentFixture<CheckpointInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckpointInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckpointInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
