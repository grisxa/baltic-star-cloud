import {Injectable} from '@angular/core';

// milliseconds, 30 sec
const DEFAULT_TIMEOUT = 30000;

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  static options: PositionOptions = {
    enableHighAccuracy: true,
    // milliseconds, 2 min
    maximumAge: 120000,
    timeout: DEFAULT_TIMEOUT
  };

  static onSuccess(resolve: (place: GeolocationPosition ) => void,
                   reject: (error: string) => void,
                   position: GeolocationPosition ) {

    if (position.coords.accuracy > 500) {
      // allow to try again in 1 sec.
      LocationService.options.maximumAge = 1000;
      return reject(`Низкая точность координат: ${position.coords.accuracy} метров`);
    } else {
      // keep for 2 min.
      LocationService.options.maximumAge = 120000;
    }
    return resolve(position);
  }

  static onError(reject: (text: string) => void,
                 error: GeolocationPositionError ) {

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

  isLocationAvailable(): boolean {
    return !!navigator.geolocation;
  }

  get(timeout?: number): Promise<GeolocationPosition> {
    LocationService.options.timeout = timeout || DEFAULT_TIMEOUT;
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        LocationService.onSuccess.bind(null, resolve, reject),
        LocationService.onError.bind(null, reject),
        LocationService.options));
  }

}
