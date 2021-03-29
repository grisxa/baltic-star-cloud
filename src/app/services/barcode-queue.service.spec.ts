import {TestBed} from '@angular/core/testing';
import {BarcodeQueueService} from './barcode-queue.service';
import {StorageService} from './storage.service';
import {AuthService} from './auth.service';

class MockAuthService {
}

class MockStorageService {
}

describe('BarcodeQueueService', () => {
  let service: BarcodeQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: StorageService, useClass: MockStorageService},
      ],
    });
    service = TestBed.inject(BarcodeQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
