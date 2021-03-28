import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {PlotarouteMapComponent} from './plotaroute-map.component';
import {SafeUrlPipe} from '../../pipes/safe-url.pipe';

describe('PlotarouteMapComponent', () => {
  let component: PlotarouteMapComponent;
  let fixture: ComponentFixture<PlotarouteMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlotarouteMapComponent, SafeUrlPipe]
    }).compileComponents();
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
