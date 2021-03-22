import Brevet from '@/models/brevet';

export interface State {
  brevets: Brevet[];
  loading: boolean;
}
