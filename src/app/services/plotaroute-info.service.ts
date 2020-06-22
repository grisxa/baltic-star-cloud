import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, switchMap} from 'rxjs/operators';
import {of, throwError} from 'rxjs';
import {RoutePoint} from '../models/route-point';


@Injectable({
  providedIn: 'root'
})
export class PlotarouteInfoService {
  private baseUrl = 'https://cors-anywhere.herokuapp.com/https://www.plotaroute.com/get_route.asp?RouteID=';

  constructor(private http: HttpClient) {
  }

  retrieve(id: number) {
    return this.http.get(this.baseUrl + id)
      .pipe(
        switchMap((data: any) => data.Error ? throwError(data.Error) : of(data)),
        map(data => {
          const route = JSON.parse(data.RouteData);

          const first = route.shift();
          let previousPoint = new RoutePoint(first);
          previousPoint.fixName('Старт');

          const checkPoints = [previousPoint];

          route.forEach(point => {
            const stepLength = this.distance(previousPoint.lat, previousPoint.lng, point.lat, point.lng);
            previousPoint = new RoutePoint({
              ...point,
              distance: previousPoint.distance + stepLength
            });
            if (previousPoint.isControl()) {
              previousPoint.fixName();
              previousPoint.fixDistance();
              checkPoints.push(previousPoint);
            }
          });

          const last = checkPoints[checkPoints.length - 1];
          if (data.Distance > last.distance + 10000) {
            const lastControl = new RoutePoint({...route.pop(), distance: data.Distance});
            lastControl.fixName('Финиш');
            lastControl.fixDistance();
            checkPoints.push(lastControl);
          }
          return {
            checkpoints: checkPoints,
            name: data.RouteName,
            length: Math.round(data.Distance / 1000)
          };
        }),
      );
  }

  /**
   * Generic geo distance calculation
   * @param lat1 - Latitude of the first point
   * @param lon1 - Longitude of the first point
   * @param lat2 - Latitude of the second point
   * @param lon2 - Longitude of the second point
   */
  distance(lat1, lon1, lat2, lon2) {
    if (lat1 === lat2 && lon1 === lon2) {
      return 0;
    }
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const R = 6371e3;
    return Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)) * R;

  }


}
