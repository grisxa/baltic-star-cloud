import {TestBed} from '@angular/core/testing';

import {CloudFirestoreService} from './cloud-firestore.service';

xdescribe('CloudFirestoreService', () => {
  let service: CloudFirestoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudFirestoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
