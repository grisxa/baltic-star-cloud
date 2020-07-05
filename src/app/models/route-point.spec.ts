import { Rider } from './rider';
import createSpy = jasmine.createSpy;
import {RoutePoint} from './route-point';

fdescribe('Route Point', () => {
  it('should create an instance', () => {
    expect(new RoutePoint(1)).toBeTruthy();
  });
  fit('should copy options to properties', () => {
    const point = new RoutePoint({lat: 1, lng: 2});
    const expected = {
      lat: 1,
      lng: 2
    };
    expect({...point}).toEqual(expected);
  });
  it('should fill basic properties', () => {
    const expected = {
      owner: '1',
      uid: '2',
      firstName: '?',
      lastName: '3',
      displayName: '? 3',
      hidden: false
    };
    const rider = new Rider('1', '2', '3');
    expect({...rider}).toEqual(expected);
  });

  describe('splitName()', () => {
    it('should fall back to an empty string', () => {
      expect(Rider.splitName()).toEqual(['?', '?']);
    });
    it('should take lastName first', () => {
      expect(Rider.splitName('self')).toEqual(['?', 'self']);
    });
    it('should split by spaces', () => {
      expect(Rider.splitName('me   self')).toEqual(['me', 'self']);
    });
    it('should ignore middle name', () => {
      expect(Rider.splitName('me my self')).toEqual(['me', 'self']);
    });
  });
});
