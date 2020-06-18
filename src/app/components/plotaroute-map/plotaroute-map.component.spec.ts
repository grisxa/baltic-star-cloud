import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotarouteMapComponent } from './plotaroute-map.component';

describe('PlotarouteMapComponent', () => {
  let component: PlotarouteMapComponent;
  let fixture: ComponentFixture<PlotarouteMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlotarouteMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotarouteMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
