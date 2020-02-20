import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderInfoComponent } from './rider-info.component';

xdescribe('RiderInfoComponent', () => {
  let component: RiderInfoComponent;
  let fixture: ComponentFixture<RiderInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
