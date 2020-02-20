import { Checkpoint } from './checkpoint';

describe('Control', () => {
  it('should create an instance', () => {
    expect(new Checkpoint('1', '2', 3)).toBeTruthy();
  });
});
