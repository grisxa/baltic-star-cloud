import {TestBed} from '@angular/core/testing';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../../../environments/environment';

import {CloudFirestoreService} from './cloud-firestore.service';

describe('CloudFirestoreService', () => {
  let service: CloudFirestoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase),
      ],
    });
    service = TestBed.inject(CloudFirestoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
