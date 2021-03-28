import {Checkpoint} from './checkpoint';
import {RoutePoint} from './route-point';

describe('Control', () => {
  it('should create an instance', () => {
    const routPoint = {
      lat: 0,
      lng: 0,
      distance: 0,
      name: 'test'
    } as RoutePoint;
    expect(new Checkpoint(routPoint)).toBeTruthy();
  });
});
