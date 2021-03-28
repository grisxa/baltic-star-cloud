import {Rider} from './rider';

describe('Rider', () => {
  it('should create an instance', () => {
    expect(new Rider('1', '2', '3')).toBeTruthy();
  });
});
