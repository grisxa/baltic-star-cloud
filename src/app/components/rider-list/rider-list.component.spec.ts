import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RiderListComponent } from './rider-list.component';

xdescribe('RiderListComponent', () => {
  let component: RiderListComponent;
  let fixture: ComponentFixture<RiderListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
