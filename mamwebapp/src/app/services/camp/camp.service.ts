import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Camp } from 'src/app/models/camp.model';
import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
  })
  export class CampService {
  
    private httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(private http: HttpClient) { }
    
    getCamps(department: string): Observable<Array<Camp>> {
      return this.http.get<Array<Camp>>(`${environment.apiUrl}/api/camp/getCamps/department`);
    }

    startCamp(camp: Camp): Observable<Camp> {
        return this.http.post<Camp>(`${environment.apiUrl}/api/camp/startCamp`, camp);
      }

    saveCamps(camp: Camp): Observable<Camp> {
        return this.http.post<Camp>(`${environment.apiUrl}/api/camp/saveCamps`, camp);
      }

    getCampDetails(id: number): Observable<Camp> {
        return this.http.get<Camp>(`${environment.apiUrl}/api/camp/getCampDetails/${id}`);
      }
}
