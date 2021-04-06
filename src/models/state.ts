import Brevet from '@/models/brevet';
import Club from '@/models/club';

export interface State {
  clubs: Club[];
  clubSelection: string[];
  brevets: Brevet[];
  loading: boolean;
  locale: string;
  title: string;
}
