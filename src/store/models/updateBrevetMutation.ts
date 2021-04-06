import Brevet from '@/models/brevet';

export default class UpdateBrevetMutation {
  type = 'updateBrevet';
  brevet: Brevet;

  constructor(brevet: Brevet) {
    this.brevet = brevet;
  }
}
