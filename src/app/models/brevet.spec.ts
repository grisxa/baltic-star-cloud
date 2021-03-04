import {Brevet, BrevetOptions} from './brevet';

describe('Brevet', () => {
  beforeEach(() => {
    // the New Year of 2021
    spyOn(Date, 'now').and.returnValue(1609448400000);
  });

  it('should not fail if no options given', () => {
    expect(new Brevet('', {} as BrevetOptions)).toBeTruthy();
  });

  it('should create an instance', () => {
    expect(new Brevet('test', {
      uid: '1',
      length: 200,
      startDate: new Date('2021-06-19T06:00:00')
    } as BrevetOptions)).toBeTruthy();
  });

  it('should copy name', () => {
    const brevet = new Brevet('test', {} as BrevetOptions);
    expect(brevet.name).toEqual('test');
  });

  it('should copy uid option', () => {
    const brevet = new Brevet('', {uid: '1'} as BrevetOptions);
    expect(brevet.uid).toEqual('1');
  });

  it('should copy length option', () => {
    const brevet = new Brevet('', {length: 200} as BrevetOptions);
    expect(brevet.length).toEqual(200);
  });

  it('should copy startDate option', () => {
    const date = new Date('2021-06-19T06:00:00');
    const brevet = new Brevet('', {startDate: date} as BrevetOptions);
    expect(brevet.startDate).toEqual(date);
  });

  describe('Online brevet detection', () => {
    it('skip the brevet without a startDate', () => {
      const brevet = new Brevet('test', {uid: '1', length: 200} as BrevetOptions);
      expect(brevet.isOnline()).toBeFalse();
    });

    it('skip old brevets', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date('2021-01-01T00:00:00')
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeFalse();
    });

    it('should catch ongoing brevets', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date('2020-12-31T23:00:00')
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeTrue();
      expect(Date.now).toHaveBeenCalled();
    });

    it('should skip finished brevets', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date('2020-12-31T23:00:00'),
        endDate: new Date('2020-12-31T23:55:00'),
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeFalsy();
      expect(Date.now).toHaveBeenCalled();
    });

    it('should catch ongoing brevets with endDate behind', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date('2020-12-31T23:00:00'),
        endDate: new Date('2021-01-01T03:00:00'),
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeTrue();
      expect(Date.now).toHaveBeenCalled();
    });
  });
});
