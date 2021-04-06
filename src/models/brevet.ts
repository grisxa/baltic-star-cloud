import Checkpoint from './checkpoint';

const HOURS_100_MILLISECONDS = 100 * 60 * 60 * 1000;
const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

export default class Brevet {
  uid: string;
  name: string;
  length: number;
  startDate: Date;
  endDate?: Date;
  mapUrl?: string;
  checkpoints?: Checkpoint[];

  constructor(snapshot: Brevet) {
    // generic copying
    Object.assign(this, snapshot);
    const {checkpoints, startDate, endDate} = snapshot;

    // mandatory fields
    this.uid = snapshot.uid;
    this.name = snapshot.name;
    this.length = snapshot.length;
    this.startDate = new Date(startDate);

    // optional fields conversion
    if (endDate) {
      this.endDate = new Date(endDate);
    }
    if (checkpoints instanceof Array) {
      this.checkpoints = checkpoints.filter((cp) => !!cp).map((cp) => new Checkpoint(cp));
    }
  }

  /**
   * Detect if the brevet is being in progress
   */

  isOnline(): boolean {
    if (!this.startDate) {
      return false;
    }
    const now = Date.now();
    const endDate = this.endDate || (this.length
      ? new Date(this.startDate.getTime() + (this.length / 12) * MILLISECONDS_IN_HOUR)
      : new Date(this.startDate.getTime() + HOURS_100_MILLISECONDS));
    return (now > this.startDate.valueOf() && now < endDate.valueOf());
  }
}
