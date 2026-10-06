import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Camp } from 'src/app/models/camp.model';
import { environment } from '../../../environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
    providedIn: 'root'
  })
  export class CampService {
    private http = inject(HttpClient);

  
    private httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    
    getCamps(department: string): Observable<Camp[]> {
      return this.http.get<Camp[]>(`${environment.apiUrl}/api/camp/getCamps/department`);
    }

    startCamp(camp: Camp): Observable<Camp> {
        return this.http.post<Camp>(`${environment.apiUrl}/api/camp/startCamp`, camp);
      }

    saveCamps(camp: Camp): Observable<Camp> {
        return this.http.post<Camp>(`${environment.apiUrl}/api/camp/saveCamps`, camp);
      }

    getCampDetails(id: number): Observable<Camp> {
        return cachedGet<Camp>(this.http, `${environment.apiUrl}/api/camp/getCampDetails/${id}`);
      }
}
