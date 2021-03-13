import {Observable} from 'rxjs';
import {Brevet} from './brevet';

export interface StorageBackend {

  listBrevets: () => Observable<Brevet[]>;
  getBrevet: (uid: string) => Observable<Brevet>;
}
