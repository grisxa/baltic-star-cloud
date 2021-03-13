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
      startDate: new Date('2021-06-19 06:00:00 GMT')
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
    const date = new Date('2021-06-19 06:00:00 GMT');
    const brevet = new Brevet('', {startDate: date} as BrevetOptions);
    expect(brevet.startDate).toEqual(date);
  });

  describe('Online brevet detection', () => {
    it('skip the brevet without a startDate', () => {
      const brevet = new Brevet('test', {uid: '1', length: 200} as BrevetOptions);
      expect(brevet.isOnline()).toBeFalse();
    });

    it('skip new brevets', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date(1609500000000)
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeFalse();
    });

    it('should catch ongoing brevets', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date(1609400000000)
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeTrue();
      expect(Date.now).toHaveBeenCalled();
    });

    it('should skip finished brevets', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date(1609400000000),
        endDate: new Date(1609430000000),
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeFalsy();
      expect(Date.now).toHaveBeenCalled();
    });

    it('should catch ongoing brevets with endDate behind', () => {
      const brevet = new Brevet('test', {
        uid: '1',
        length: 200,
        startDate: new Date(1609000000000),
        endDate: new Date(1609500000000),
      } as BrevetOptions);
      expect(brevet.isOnline()).toBeTrue();
      expect(Date.now).toHaveBeenCalled();
    });
  });
});
