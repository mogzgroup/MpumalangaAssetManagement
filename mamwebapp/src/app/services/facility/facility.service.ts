import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FacilityType } from '../../models/facility-type.model';
import { DashboardWedge } from '../../models/dashboard-wedge.model';
import { MapCoordinate } from 'src/app/models/map-oordinate.model';
import { Facility } from 'src/app/models/facility.model';
import { Observable } from 'rxjs';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  constructor(private http: HttpClient) { }
  
  getFacilityZonings(): Observable<FacilityType[]> {
    return cachedGet<FacilityType[]>(this.http, `${environment.apiUrl}/api/facility/getfacilityzonings`);
  }

  getDashboardWedges() {
    return cachedGet<DashboardWedge[]>(this.http, `${environment.apiUrl}/api/facility/getdashboardwedges`);
  }

  getMapCoordinates() {
    return cachedGet<Array<MapCoordinate>>(this.http, `${environment.apiUrl}/api/facility/getmapcoordinates`);
  } 

  getAllFacilities() {
    return cachedGet<Array<Facility>>(this.http, `${environment.apiUrl}/api/facility/getallfacilities`);
  }

  getAssetRegisterfacilities() {
    return cachedGet<Array<Facility>>(this.http, `${environment.apiUrl}/api/facility/getassetregisterfacilities`);
  }

  getFacilityById(id: number, facilityType) {
    return cachedGet<Facility>(this.http, `${environment.apiUrl}/api/facility/getFacilityByCode/${id}/${facilityType}`);
  }

  deleteFacility(id : number) {
    return this.http.delete<Facility>(`${environment.apiUrl}/api/facility/deleteFacility/`+ id );
  }

  updateFacility(facility : Facility, step: string) {
    return this.http.post<Facility>(`${environment.apiUrl}/api/facility/updateFacility/` + step, facility);
  }

  saveFacility(facility : Facility, step: string) {
    return this.http.post<Facility>(`${environment.apiUrl}/api/facility/saveFacility/` + step, facility);
  }

  uploadFiles(files : any, fileName: string) {
    const formData: FormData = new FormData();
    files.forEach(file => {
      formData.append('file', file, file.name);
    });
    
    let header = new HttpHeaders({
        'enctype': 'multipart/form-data',
        'Accept': 'application/json'
      });
 
    return this.http.post<Facility>(`${environment.apiUrl}/api/facility/uploadFiles/`+ fileName, formData,{ headers: header });
  }

  getFiles(fileReference: string) {
    return this.http.get<any[]>(`${environment.apiUrl}/api/facility/getFiles/`+fileReference);
  }

}
