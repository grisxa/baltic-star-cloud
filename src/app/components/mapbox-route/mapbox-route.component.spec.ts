import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxRouteComponent } from './mapbox-route.component';

describe('MapboxRouteComponent', () => {
  let component: MapboxRouteComponent;
  let fixture: ComponentFixture<MapboxRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapboxRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
