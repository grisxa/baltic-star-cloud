import { Brevet } from './brevet';

describe('Brevet', () => {
  it('should create an instance', () => {
    expect(new Brevet('1', '2', 3, Timestamp.now())).toBeTruthy();
  });
});
