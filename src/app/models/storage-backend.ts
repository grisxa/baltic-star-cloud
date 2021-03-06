import {Observable} from 'rxjs';
import {Brevet} from './brevet';

export abstract class StorageBackend {

  abstract listBrevets(): Observable<Brevet[]> ;
}
