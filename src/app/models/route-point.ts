export class RoutePoint {
  lat: number;
  lng: number;
  distance = 0;
  name: string;

  dir?: string;
  labtxt?: string;

  constructor(options) {
    Object.assign(this, options);
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
   * @param replacement - optional control name if not specified in the route
   */
  fixName(replacement?: string) {
    this.name = this.dir || this.labtxt || replacement;

  }
}
