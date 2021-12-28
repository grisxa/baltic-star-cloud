export class TrackNotFound extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TrackNotFound.prototype);
  }
}
