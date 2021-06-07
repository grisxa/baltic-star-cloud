import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  static prefix = 'brevet.online/';

  getValue(key: string) {
    const value = localStorage.getItem(SettingService.prefix + key);
    return value === 'undefined' ? undefined : JSON.parse(value || 'null');
  }

  setValue(key: string, value: unknown): void {
    localStorage.setItem(SettingService.prefix + key, JSON.stringify(value));
  }

  injectToken(key: string, token: string, value: unknown): boolean {
    const oldValue = this.getValue(key);

    if (!oldValue) {
      this.setValue(key, {[token]: value});
      return true;
    } else if (oldValue instanceof Object) {
      oldValue[token] = value;
      this.setValue(key, oldValue);
      return true;
    }
    console.error(`Unsupported type of ${key}`);
    return false;
  }

  replaceToken(key: string, token: string, value: string): string {
    const oldValue = this.getValue(key);

    if (!oldValue) {
      console.error(`Key not found: ${key}`);
    } else if (oldValue instanceof Object) {
      if (token in oldValue) {
        oldValue[value] = oldValue[token];
        delete oldValue[token];
        this.setValue(key, oldValue);
      } else {
        console.error(`Token not found in ${key}: ${token}`);
      }
    } else {
      console.error(`Unsupported type of ${key}`);
    }
    return value;
  }

  removeKey(key: string) {
    return localStorage.removeItem(SettingService.prefix + key);
  }

  removeToken(key: string, token: string) {
    const oldValue = this.getValue(key);

    if (!oldValue) {
      console.error(`Key not found: ${key}`);
    } else if (oldValue instanceof Object) {
      if (token in oldValue) {
        delete oldValue[token];
        this.setValue(key, oldValue);
      } else {
        console.error(`Token not found in ${key}: ${token}`);
      }
    } else {
      console.error(`Unsupported type of ${key}`);
    }
  }


}
