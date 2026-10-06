import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConditionAssessment } from 'src/app/models/condition-assessment.model';
import { environment } from 'src/environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
  providedIn: 'root'
})
export class ConditionAssessmentService {
    private http = inject(HttpClient);


    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

      getConditionAssessments(facilityId: number): Observable<any>{
        return cachedGet<ConditionAssessment[]>(this.http, `${environment.apiUrl}/api/conditionassessment/getconditionassessments/${facilityId}`);
      }
    
      saveConditionAssessment(ConditionAssessment: ConditionAssessment){
        return this.http.post<number>(`${environment.apiUrl}/api/conditionassessment/saveconditionassessment`,ConditionAssessment);
      }
}
