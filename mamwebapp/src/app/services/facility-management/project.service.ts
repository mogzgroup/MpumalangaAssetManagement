import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Facility } from 'src/app/models/facility.model';
import { Project } from 'src/app/models/project.model';
import { environment } from 'src/environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    constructor(private http: HttpClient) { }

    getProjects(): Observable<Array<Project>> {
        return cachedGet<Array<Project>>(this.http, `${environment.apiUrl}/api/project/getprojects`);
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

    getProperties(): Observable<Array<Facility>> {
        return cachedGet<Array<Facility>>(this.http, `${environment.apiUrl}/api/project/getproperties`, 300_000);
    }

    getTowns(): Observable<Array<Facility>> {
        return cachedGet<Array<Facility>>(this.http, `${environment.apiUrl}/api/facility/gettowns`, 300_000);
    }

    getBuildingByTown(town): Observable<Array<Facility>> {
        return cachedGet<Array<Facility>>(this.http, `${environment.apiUrl}/api/facility/getbuildings/${town}`, 300_000);
    }
}
