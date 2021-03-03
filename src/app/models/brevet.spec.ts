import {Brevet, BrevetOptions} from './brevet';

describe('Brevet', () => {
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
});
