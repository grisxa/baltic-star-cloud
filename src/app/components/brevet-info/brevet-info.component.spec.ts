import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrevetInfoComponent } from './brevet-info.component';

xdescribe('BrevetInfoComponent', () => {
  let component: BrevetInfoComponent;
  let fixture: ComponentFixture<BrevetInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrevetInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
