import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Brevet} from '../../models/brevet';
import {StorageBackend} from '../../models/storage-backend';

@Injectable({
  providedIn: 'root'
})
export class NoneStorageService implements StorageBackend {

  constructor() {
  }

  listBrevets = (): Observable<Brevet[]> => of([]);
}
