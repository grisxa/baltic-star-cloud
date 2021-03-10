import {Checkpoint} from './checkpoint';

export interface BrevetOptions {
  name: string;
  uid: string;
  length: number;
  startDate: Date;
  endDate: Date;
}
const HOURS_100_MILLISECONDS = 100*60*60*1000;

export class Brevet {
  uid: string;
  name: string;
  length: number;
  startDate: Date;
  endDate?: Date;
  mapUrl?: string;
  checkpoints?: Checkpoint[];

  constructor(name: string, options: BrevetOptions) {
    Object.assign(this, options);
    this.name = name;
  }

  isOnline(): boolean {
    if (!this.startDate) {
      return false;
    }
    const now = Date.now();
    const endDate = this.endDate ||
      new Date(this.startDate.getTime() + HOURS_100_MILLISECONDS);
    return (now > this.startDate.valueOf() && now < endDate.valueOf());
  }
}
