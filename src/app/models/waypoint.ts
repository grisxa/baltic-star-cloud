export class Waypoint {
  lat: number;
  lng: number;
  name: string;

  // to the start by track
  distance = 0;

  dir?: string;
  labtxt?: string;

  constructor(options) {
    Object.assign(this, options);
  }
}
