import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  static options: PositionOptions = {
    enableHighAccuracy: true,
    // milliseconds, 10 min
    maximumAge: 600000,
    // milliseconds, 30 sec
    timeout: 30000
  };

  static onSuccess(resolve: (position: Position) => void,
                   reject: (error: string) => void,
                   position: Position) {

    console.log('= current locaton', position);

    if (position.coords.accuracy > 500) {
      return reject(`Низкая точность координат: ${position.coords.accuracy} метров`);
    }
    return resolve(position);
  }

  static onError(reject: (error: string) => void,
                 error: PositionError) {

    console.error('= location failure', error);

    let message = 'test';
    if (error.code === error.PERMISSION_DENIED) {
      message = `Определение координат запрещено. ${error.message}`;
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      message = `Не удалось определить координаты. ${error.message}`;
    } else if (error.code === error.TIMEOUT) {
      message = `Не удалось определить координаты. ${error.message}`;
    }
    reject(message);
  }

  constructor() {
  }

  get() {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        LocationService.onSuccess.bind(null, resolve, reject),
        LocationService.onError.bind(null, reject),
        LocationService.options));
  }

}
