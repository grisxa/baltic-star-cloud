import {Waypoint} from './waypoint';

describe('Route Point', () => {
  it('should create an instance', () => {
    expect(new Waypoint(1)).toBeTruthy();
  });
  it('should copy options to properties', () => {
    const point = new Waypoint({lat: 1, lng: 2});
    const expected = {
      distance: 0,
      lat: 1,
      lng: 2,
    } as Waypoint;
    expect({...point}).toEqual(expected);
  });
});
