import Brevet from '@/models/brevet';
import Club from '@/models/club';

export interface State {
  clubs: Club[];
  brevets: Brevet[];
  loading: boolean;
}
