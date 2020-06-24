import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

xdescribe('StorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StorageService = TestBed.inject(StorageService);
    expect(service).toBeTruthy();
  });
});
