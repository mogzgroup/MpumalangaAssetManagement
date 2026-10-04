import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LeasedProperty } from 'src/app/models/leased-property.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeasedPropertiesService {
     
      constructor(private http: HttpClient) { }

      getLeasedProperties(): Observable<any>{
        return this.http.get<Array<LeasedProperty>>(`${environment.apiUrl}/api/leasemanagement/getleasedproperties`);
      }

      getLeasedPropertyDetails(leasedProperty): Observable<any>{
        return this.http.post<any>(`${environment.apiUrl}/api/leasemanagement/getleasedpropertydetails`, leasedProperty);
      }

      deleteLeasedProperty(leasedProperty: LeasedProperty){
        return this.http.post<boolean>(`${environment.apiUrl}/api/leasemanagement/deleteLeasedProperty`,leasedProperty);
      }

      uploadHandoverDocuments(files : any, fileName: string) {
        const formData: FormData = new FormData();
        files.forEach(file => {
          formData.append('file', file, file.name);
        });
        
        let header = new HttpHeaders({
            'enctype': 'multipart/form-data',
            'Accept': 'application/json'
          });
     
        return this.http.post<any>(`${environment.apiUrl}/api/facility/uploadHandoverDocuments/`+ fileName, formData,{ headers: header });
      }

      uploadSnagListFiles(files : any, fileName: string) {
        const formData: FormData = new FormData();
        files.forEach(file => {
          formData.append('file', file, file.name);
        });
        
        let header = new HttpHeaders({
            'enctype': 'multipart/form-data',
            'Accept': 'application/json'
          });
     
        return this.http.post<any>(`${environment.apiUrl}/api/facility/uploadSnagListFiles/`+ fileName, formData,{ headers: header });
      }
}

