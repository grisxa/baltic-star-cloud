import {Brevet} from './brevet';
import {Waypoint} from './waypoint';

export class Checkpoint {
  name: string;
  uid: string;

  // to the start by track
  distance?: number;

  // to the current position
  delta?: number;

  coordinates?: GeolocationCoordinates;

  // it's a sleeping place
  sleep?: boolean;

  // no volunteers
  selfCheck?: boolean;

  // Checkpoint info page, brevet info
  brevet?: Brevet;

  constructor(wayPoint: Waypoint) {
    this.name = wayPoint.name;
    this.distance = wayPoint.distance;
    this.coordinates = {
      latitude: wayPoint.lat || 0,
      longitude: wayPoint.lng || 0
    } as GeolocationCoordinates;
  }
}
