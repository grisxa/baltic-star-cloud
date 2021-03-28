import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrevetListComponent } from './brevet-list.component';

xdescribe('BrevetListComponent', () => {
  let component: BrevetListComponent;
  let fixture: ComponentFixture<BrevetListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BrevetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
