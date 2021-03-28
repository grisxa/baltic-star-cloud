import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, switchMap} from 'rxjs/operators';
import {of, throwError} from 'rxjs';
import {RoutePoint} from '../models/route-point';
import {PlotaroutePoint} from '../models/plotaroute-point';


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
          const route: PlotaroutePoint[] = JSON.parse(data.RouteData || '[]');
          const checkPoints = [];

          let previousPoint: RoutePoint;
          const first = route.shift();
          if (first) {
            previousPoint = new RoutePoint(first);
            previousPoint.fixName('Старт');
            checkPoints.push(previousPoint);
          }

          route.forEach((point: PlotaroutePoint) => {
            const stepLength = this.distance(previousPoint.lat, previousPoint.lng,
              point.lat, point.lon);
            previousPoint = new RoutePoint({
              ...point,
              distance: previousPoint.distance + stepLength
            });
            console.log('= new point', previousPoint);
            if (previousPoint.isControl()) {
              previousPoint.fixName();
              checkPoints.push(previousPoint);
            }
          });

          const last = checkPoints[checkPoints.length - 1];
          // check if the last control is too far from the track end
          if (route.length > 0 && data.Distance > last.distance + 10000) {
            const lastControl = new RoutePoint({
              ...route[route.length - 1],
              distance: data.Distance
            });
            lastControl.fixName('Финиш');
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
   *
   * @param lat1 - Latitude of the first point
   * @param lon1 - Longitude of the first point
   * @param lat2 - Latitude of the second point
   * @param lon2 - Longitude of the second point
   */

  distance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (lat1 === lat2 && lon1 === lon2) {
      return 0;
    }
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const R = 6371e3;
    return Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)) * R;

  }


}
