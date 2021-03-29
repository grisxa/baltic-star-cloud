export class Offline extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, Offline.prototype);
  }
}
