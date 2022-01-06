import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AfterStravaComponent} from './after-strava.component';
import {StravaActivityService} from '../../services/strava-activity.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';

class MockRoute {
}

class MockStravaService {
}

describe('AfterStravaComponent', () => {
  let component: AfterStravaComponent;
  let fixture: ComponentFixture<AfterStravaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(
        [{path: 'brevets', component: MockRoute}]
      ),
        MatSnackBarModule],
      providers: [
        {provide: StravaActivityService, useClass: MockStravaService},
      ],
      declarations: [AfterStravaComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AfterStravaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
