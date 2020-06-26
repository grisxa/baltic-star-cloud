import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxDialogComponent } from './mapbox-dialog.component';

describe('MapboxDialogComponent', () => {
  let component: MapboxDialogComponent;
  let fixture: ComponentFixture<MapboxDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
