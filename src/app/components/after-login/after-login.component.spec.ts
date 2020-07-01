import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterLoginComponent } from './after-login.component';

describe('AfterLoginComponent', () => {
  let component: AfterLoginComponent;
  let fixture: ComponentFixture<AfterLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AfterLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AfterLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
