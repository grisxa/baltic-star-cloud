import { TestBed } from '@angular/core/testing';

import { PlotarouteInfoService } from './plotaroute-info.service';

describe('PlotarouteInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlotarouteInfoService = TestBed.get(PlotarouteInfoService);
    expect(service).toBeTruthy();
  });
});
