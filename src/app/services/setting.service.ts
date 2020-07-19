import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor() {
  }

  getValue(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  setValue(key: string, value): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
