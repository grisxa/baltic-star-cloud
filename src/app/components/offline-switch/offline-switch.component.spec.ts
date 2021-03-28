import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {OfflineSwitchComponent} from './offline-switch.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

describe('OfflineSwitchComponent', () => {
  let component: OfflineSwitchComponent;
  let fixture: ComponentFixture<OfflineSwitchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSlideToggleModule],
      declarations: [OfflineSwitchComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
