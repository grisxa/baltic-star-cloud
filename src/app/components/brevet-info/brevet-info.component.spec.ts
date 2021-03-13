import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrevetInfoComponent } from './brevet-info.component';

describe('BrevetInfoComponent', () => {
  let component: BrevetInfoComponent;
  let fixture: ComponentFixture<BrevetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrevetInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrevetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
