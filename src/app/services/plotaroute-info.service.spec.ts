import { TestBed } from '@angular/core/testing';

import { PlotarouteInfoService } from './plotaroute-info.service';

xdescribe('PlotarouteInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlotarouteInfoService = TestBed.inject(PlotarouteInfoService);
    expect(service).toBeTruthy();
  });
});
