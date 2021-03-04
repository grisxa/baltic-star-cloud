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

  constructor(name: string, options: BrevetOptions) {
    this.uid = options.uid;
    this.name = name;
    this.length = options.length;
    this.startDate = options.startDate;
    this.endDate = options.endDate;
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
