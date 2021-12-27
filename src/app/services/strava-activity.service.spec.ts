import { TestBed } from '@angular/core/testing';

import { StravaActivityService } from './strava-activity.service';

xdescribe('StravaActivityService', () => {
  let service: StravaActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StravaActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
