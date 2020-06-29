export class CheckpointNotFound extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CheckpointNotFound.prototype);
  }
}
