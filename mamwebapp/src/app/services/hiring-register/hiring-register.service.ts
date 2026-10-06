import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HiredProperty } from 'src/app/models/hired-property';
import { environment } from 'src/environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
  providedIn: 'root'
})
export class HiringRegisterService {
  private http = inject(HttpClient);


  getHiredProperties(): Observable<any> {
    return cachedGet<HiredProperty[]>(this.http, `${environment.apiUrl}/api/hiringregister/gethiredproperties`);
  }

  addHiredProperty(hiredProperty: HiredProperty) {
    return this.http.post<number>(`${environment.apiUrl}/api/hiringregister/addhiredproperty`, hiredProperty);
  }

  updateHiredProperty(hiredProperty: HiredProperty) {
    return this.http.post<boolean>(`${environment.apiUrl}/api/hiringregister/updatehiredproperty`, hiredProperty);
  }
  deleteHiredProperty(hiredProperty: HiredProperty) {
    return this.http.post<boolean>(`${environment.apiUrl}/api/hiringregister/deletehiredproperty`, hiredProperty);
  }
}
