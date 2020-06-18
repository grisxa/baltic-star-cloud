import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, switchMap} from 'rxjs/operators';
import {of, throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PlotarouteInfoService {
  private baseUrl = 'https://www.plotaroute.com/get_route.asp?RouteID=';

  constructor(private http: HttpClient) {
  }

  retrieve(id: number) {
    // console.log('= retireve route info', id);
    return this.http.get(this.baseUrl + id)
      .pipe(
        switchMap((data: any) => data.Error ? throwError(data.Error) : of(data)),
        map((data: any) => ({name: data.RouteName, length: Math.round(data.Distance / 1000)}))
      );
  }
}
