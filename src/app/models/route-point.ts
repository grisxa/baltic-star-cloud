import {PlotaroutePoint} from './plotaroute-point';

export class RoutePoint {
  lat = 0;
  lng = 0;
  distance = 0;
  name?: string;

  dir?: string;
  labtxt?: string;

  constructor(options: PlotaroutePoint & { distance?: number }) {
    this.lat = options.lat;
    this.lng = options.lng;
    this.distance = options.distance || 0;
    this.dir = options.dir;
    this.labtxt = options.labtxt;
  }

  /**
   * How we can decide if the route point is a control - by the name prefix
   */
  isControl() {
    const direction = this.dir || '';
    const label = this.labtxt || '';
    return direction.startsWith('КП') ||
      direction.startsWith('CP') ||
      label.startsWith('КП') ||
      label.startsWith('CP');
  }

  /**
   * Copy the point description to the name property
   *
   * @param replacement - optional control name if not specified in the route
   */

  fixName(replacement?: string) {
    this.name = this.dir || this.labtxt || replacement;

  }
}
