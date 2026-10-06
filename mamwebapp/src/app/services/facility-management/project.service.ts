import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Facility } from 'src/app/models/facility.model';
import { Project } from 'src/app/models/project.model';
import { environment } from 'src/environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private http = inject(HttpClient);


    getProjects(): Observable<Project[]> {
        return cachedGet<Project[]>(this.http, `${environment.apiUrl}/api/project/getprojects`);
    }

    addProject(project: Project) {
        return this.http.post<number>(`${environment.apiUrl}/api/project/addproject`, project);
    }

    updateProject(project: Project) {
        return this.http.post<Project>(`${environment.apiUrl}/api/project/updateproject`, project);
    }
    deleteProject(project: Project) {
        return this.http.post<boolean>(`${environment.apiUrl}/api/project/deleteproject`, project);
    }

    getProperties(): Observable<Facility[]> {
        return cachedGet<Facility[]>(this.http, `${environment.apiUrl}/api/project/getproperties`, 300_000);
    }

    getTowns(): Observable<Facility[]> {
        return cachedGet<Facility[]>(this.http, `${environment.apiUrl}/api/facility/gettowns`, 300_000);
    }

    getBuildingByTown(town): Observable<Facility[]> {
        return cachedGet<Facility[]>(this.http, `${environment.apiUrl}/api/facility/getbuildings/${town}`, 300_000);
    }
}
