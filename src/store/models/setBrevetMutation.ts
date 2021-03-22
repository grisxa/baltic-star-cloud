import Brevet from '@/models/brevet';

export default class SetBrevetMutation {
  type = 'setBrevets';
  brevets: Brevet[];

  constructor(brevets: Brevet[]) {
    this.brevets = brevets;
  }
}
