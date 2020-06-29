import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineSwitchComponent } from './offline-switch.component';

describe('OfflineSwitchComponent', () => {
  let component: OfflineSwitchComponent;
  let fixture: ComponentFixture<OfflineSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
