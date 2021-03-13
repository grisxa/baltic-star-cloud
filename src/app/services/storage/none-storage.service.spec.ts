import {TestBed} from '@angular/core/testing';
import {Brevet} from '../../models/brevet';

import {NoneStorageService} from './none-storage.service';

describe('NoneService', () => {
  let service: NoneStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoneStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list no brevets', async () => {
    service.listBrevets().subscribe(value => {
      expect(value).toEqual([]);
    });
  });

  it('should find an empty brevet', async () => {
    service.getBrevet().subscribe(value => {
      expect(value).toEqual({} as Brevet);
    });
  });
});
