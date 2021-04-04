import Club from '@/models/club';

export default class SetClubsMutation {
  type = 'setClubs';
  clubs: Club[];

  constructor(clubs: Club[]) {
    this.clubs = clubs;
  }
}
