import Brevet from '@/models/brevet';

export default class SetBrevetsMutation {
  type = 'setBrevets';
  brevets: Brevet[];

  constructor(brevets: Brevet[]) {
    this.brevets = brevets;
  }
}
