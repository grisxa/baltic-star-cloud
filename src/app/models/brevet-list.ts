import {Brevet} from './brevet';

export class BrevetList {
  brevets: Brevet[];

  constructor(brevets: Brevet[]) {
    this.brevets = brevets;
  }

  static fromDoc(doc: BrevetList) {
    const brevets = doc.brevets.map(brevet => new Brevet(brevet.uid, brevet.name, brevet.length, brevet.startDate));
    return new BrevetList(brevets);
  }
}
