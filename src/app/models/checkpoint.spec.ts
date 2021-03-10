import {Checkpoint} from './checkpoint';
import {Waypoint} from './waypoint';

describe('Checkpoint', () => {
  it('should create an instance', () => {
    expect(new Checkpoint({} as Waypoint)).toBeTruthy();
  });
});
