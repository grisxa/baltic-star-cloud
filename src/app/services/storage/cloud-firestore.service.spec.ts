import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {AngularFireModule} from '@angular/fire';
import firebase from 'firebase/app';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {Brevet} from '../../models/brevet';
import {Checkpoint} from '../../models/checkpoint';

import {BrevetDocument, BrevetListDocument, CloudFirestoreService} from './cloud-firestore.service';
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

  describe('brevet inflator', () => {
    it('should load empty document', () => {
      const expected = {
        startDate: undefined,
        endDate: undefined,
        checkpoints: undefined,
        name: undefined
      } as Brevet;
      const brevet = service.inflateBrevet({} as BrevetDocument);
      expect(Object.assign({}, brevet)).toEqual(expected);
    });

    it('should copy the name', () => {
      const brevet = service.inflateBrevet({name: 'test'} as BrevetDocument);
      expect(brevet.name).toEqual('test');
    });

    it('should convert Timestamp', () => {
      const brevet = service.inflateBrevet({
        startDate: new Timestamp(0, 0),
        endDate: new Timestamp(1609448400, 0),
      } as BrevetDocument);
      expect(brevet.startDate).toEqual(new Date('1970-01-01'));
      expect(brevet.endDate).toEqual(new Date('2021-01-01T00:00:00'));
    });

    it('should inflate checkpoints as well', () => {
      const expected = [
        {name: 'cp1', distance: 1, coordinates: {latitude: 0, longitude: 0}} as Checkpoint,
        {name: 'cp2', distance: 2, coordinates: {latitude: 0, longitude: 0}} as Checkpoint
      ];
      const brevet = service.inflateBrevet({
        checkpoints: [
          {name: 'cp1', distance: 1},
          {name: 'cp2', distance: 2},
        ]
      } as BrevetDocument);
      expect(brevet.checkpoints.map(cp => Object.assign({}, cp))).toEqual(expected);
    });
  });

  describe('brevet list', () => {
    it('should return a valid document', (done) => {
      const fixture: BrevetListDocument = {
        brevets: [
          {
            length: 202,
            uid: '7LsUWNa6x8UcyYeImkIA',
            startDate: new Timestamp(1582441260, 0),
            checkpoints: [
              {
                uid: 'L1CH43VC6Bjhbm14BHDU',
                distance: 0,
                name: 'Старт: Зеленогорск'
              }
            ],
            name: 'Выборгский'
          },
          {
            checkpoints: [
              {
                distance: 0,
                name: 'Старт: Стрельна',
                uid: 'TReXUTFaTvNeq6dTpqGA'
              }
            ],
            endDate: new Timestamp(1583787540, 0),
            length: 201,
            name: 'Волосовский',
            uid: 'X4sfDNGJr0JaqTZLZtMf',
            startDate: new Timestamp(1583560800, 0),
          },
          {
            startDate: new Timestamp(1615009800, 0),
            endDate: new Timestamp(1615058400, 0),
            checkpoints: [
              {
                distance: 0,
                name: 'Старт: Рощино',
                uid: 'yAbUSXugUh9Idi9Hrboc'
              }
            ],
            length: 204,
            uid: 'de5iR7gIfdCR8s87PW6O',
            name: 'Волоярвинский'
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

  describe('brevet description', () => {
    it('should return undefined if failed to find', (done) => {
      spyOn(service, 'getBrevetListDocument')
        .and.returnValue(of({brevets: []} as BrevetListDocument));
      spyOn(service, 'getBrevetDocument')
        .and.returnValue(of(undefined));

      service.getBrevet().subscribe(value => {
        expect(value).not.toBeDefined();
        done();
      });
    });

    it('should return an item from the list', (done) => {
      const brevetsFixture: BrevetListDocument = {
        brevets: [
          {
            uid: '1',
            length: 1,
            name: 'test1',
          } as BrevetDocument
        ]
      };
      spyOn(service, 'getBrevetListDocument')
        .and.returnValue(of(brevetsFixture));
      spyOn(service, 'getBrevetDocument')
        .and.returnValue(of(undefined));

      service.getBrevet('1').subscribe(value => {
        expect(value.uid).toEqual('1');
        expect(value.name).toEqual('test1');
        done();
      });
    });

    it('should drop a list item if a document has been already received', fakeAsync(() => {
      const brevetsFixture: BrevetListDocument = {
        brevets: [
          {
            uid: '2',
            length: 22,
            name: 'test22',
          } as BrevetDocument
        ]
      };
      const brevetFixture = {
        uid: '2',
        length: 2,
        name: 'test2',
      } as BrevetDocument;

      let brevet;

      spyOn(service, 'getBrevetListDocument')
        .and.returnValue(of(brevetsFixture).pipe(delay(100)));
      spyOn(service, 'getBrevetDocument')
        .and.returnValue(of(brevetFixture).pipe(delay(50)));

      service.getBrevet('2').subscribe(value => {
        brevet = value;
      });

      expect(brevet).not.toBeDefined();

      tick(60);
      // document received
      expect(brevet.uid).toEqual('2');
      expect(brevet.name).toEqual('test2');

      tick(50);
      // list ignored
      expect(brevet.uid).toEqual('2');
      expect(brevet.name).toEqual('test2');
    }));

    it('should not drop a list item if a document not found', fakeAsync(() => {
      const brevetsFixture: BrevetListDocument = {
        brevets: [
          {
            uid: '4',
            length: 4,
            name: 'test4',
          } as BrevetDocument
        ]
      };

      let brevet;

      spyOn(service, 'getBrevetListDocument')
        .and.returnValue(of(brevetsFixture).pipe(delay(100)));
      spyOn(service, 'getBrevetDocument')
        .and.returnValue(of(undefined).pipe(delay(50)));

      service.getBrevet('4').subscribe(value => {
        brevet = value;
      });

      expect(brevet).not.toBeDefined();

      tick(60);
      // not found
      expect(brevet).not.toBeDefined();

      tick(50);
      // list updated
      expect(brevet.uid).toEqual('4');
      expect(brevet.name).toEqual('test4');
    }));

    it('should wait for a document update', fakeAsync(() => {
      const brevetsFixture: BrevetListDocument = {
        brevets: [
          {
            uid: '3',
            length: 3,
            name: 'test3',
          } as BrevetDocument
        ]
      };
      const brevetFixture = {
        uid: '3',
        length: 33,
        name: 'test33',
      } as BrevetDocument;

      let brevet;

      spyOn(service, 'getBrevetListDocument')
        .and.returnValue(of(brevetsFixture).pipe(delay(50)));
      spyOn(service, 'getBrevetDocument')
        .and.returnValue(of(brevetFixture).pipe(delay(100)));
      service.getBrevet('3').subscribe(value => {
        brevet = value;
      });

      expect(brevet).not.toBeDefined();

      tick(60);
      // list received
      expect(brevet.uid).toEqual('3');
      expect(brevet.length).toEqual(3);
      expect(brevet.name).toEqual('test3');

      tick(50);
      // document updated
      expect(brevet.uid).toEqual('3');
      expect(brevet.length).toEqual(33);
      expect(brevet.name).toEqual('test33');
    }));
  });
});
