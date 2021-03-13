import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Brevet} from '../../models/brevet';
import {StorageBackend} from '../../models/storage-backend';

@Injectable({
  providedIn: 'root'
})
export class NoneStorageService implements StorageBackend {
  listBrevets = (): Observable<Brevet[]> => of([]);
  getBrevet = (): Observable<Brevet> => of({} as Brevet);
}
