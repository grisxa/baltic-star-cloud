import {TestBed} from '@angular/core/testing';
import {AngularFireModule} from '@angular/fire';
import firebase from 'firebase/app';
import {of} from 'rxjs';
import {environment} from '../../../environments/environment';

import {BrevetListDocument, CloudFirestoreService} from './cloud-firestore.service';
import Timestamp = firebase.firestore.Timestamp;

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

  describe('brevet list', () => {
    it('should return a valid document', (done) => {
      const fixture: BrevetListDocument = {
        'brevets': [
          {
            'length': 202,
            'uid': '7LsUWNa6x8UcyYeImkIA',
            'startDate': new Timestamp(1582441260, 0),
            'checkpoints': [
              {
                'uid': 'L1CH43VC6Bjhbm14BHDU',
                'distance': 0,
                'name': 'Старт: Зеленогорск'
              }
            ],
            'name': 'Выборгский'
          },
          {
            'checkpoints': [
              {
                'distance': 0,
                'name': 'Старт: Стрельна',
                'uid': 'TReXUTFaTvNeq6dTpqGA'
              }
            ],
            'endDate': new Timestamp(1583787540, 0),
            'length': 201,
            'name': 'Волосовский',
            'uid': 'X4sfDNGJr0JaqTZLZtMf',
            'startDate': new Timestamp(1583560800, 0),
          },
          {
            'startDate': new Timestamp(1615009800, 0),
            'endDate': new Timestamp(1615058400, 0),
            'checkpoints': [
              {
                'distance': 0,
                'name': 'Старт: Рощино',
                'uid': 'yAbUSXugUh9Idi9Hrboc'
              }
            ],
            'length': 204,
            'uid': 'de5iR7gIfdCR8s87PW6O',
            'name': 'Волоярвинский'
          }
        ]
      };
      spyOn(service, 'getBrevetListDocument').and.returnValue(of(fixture));
      service.listBrevets().subscribe(brevets => {
        expect(brevets.length).toEqual(3);
        expect(brevets.map(brevet => brevet.uid)).toEqual([
          '7LsUWNa6x8UcyYeImkIA',
          'X4sfDNGJr0JaqTZLZtMf',
          'de5iR7gIfdCR8s87PW6O',
        ]);
        expect(service.getBrevetListDocument).toHaveBeenCalled();
        done();
      });
    });

    it('should return nothing of an invalid document', (done) => {
      spyOn(service, 'getBrevetListDocument').and.returnValue(of({} as BrevetListDocument));
      service.listBrevets().subscribe(value => {
        expect(value.length).toEqual(0);
        expect(service.getBrevetListDocument).toHaveBeenCalled();
        done();
      });
    });

  });
});
