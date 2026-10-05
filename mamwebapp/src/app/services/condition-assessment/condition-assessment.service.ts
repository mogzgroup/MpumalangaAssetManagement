import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConditionAssessment } from 'src/app/models/condition-assessment.model';
import { Facility } from 'src/app/models/facility.model';
import { environment } from 'src/environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
  providedIn: 'root'
})
export class ConditionAssessmentService {

    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
      constructor(private http: HttpClient) { }

      getConditionAssessments(facilityId: number): Observable<any>{
        return cachedGet<Array<ConditionAssessment>>(this.http, `${environment.apiUrl}/api/conditionassessment/getconditionassessments/${facilityId}`);
      }
    
      saveConditionAssessment(ConditionAssessment: ConditionAssessment){
        return this.http.post<number>(`${environment.apiUrl}/api/conditionassessment/saveconditionassessment`,ConditionAssessment);
      }
}
