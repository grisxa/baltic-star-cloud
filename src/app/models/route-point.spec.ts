import {RoutePoint} from './route-point';
import {PlotaroutePoint} from './plotaroute-point';

describe('Route Point', () => {
  it('should create an instance', () => {
    expect(new RoutePoint({} as PlotaroutePoint)).toBeTruthy();
  });
  it('should copy options to properties', () => {
    const point = new RoutePoint({lat: 1, lon: 2});
    const expected = {
      lat: 1,
      lng: 2,
      distance: 0
    };
    expect({...point}).toEqual(expected);
  });
});
