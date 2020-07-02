import { TestBed } from '@angular/core/testing';

import { ToneService } from './tone.service';

describe('ToneService', () => {
  let service: ToneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
