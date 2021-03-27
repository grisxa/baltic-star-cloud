import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor() {
  }

  getValue(key: string) {
    const value = localStorage.getItem(key);
    return value === 'undefined' ? undefined : JSON.parse(value || '{}');
  }

  setValue(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
