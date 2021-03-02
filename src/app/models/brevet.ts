export interface BrevetOptions {
  name: string,
  uid: string,
  length: number,
  startDate: Date
}

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
  }
}
