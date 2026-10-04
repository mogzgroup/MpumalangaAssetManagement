import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Facility } from 'src/app/models/facility.model';
import { Project } from 'src/app/models/project.model';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    constructor(private http: HttpClient) { }

    getProjects(): Observable<Array<Project>> {
        return this.http.get<Array<Project>>(`${environment.apiUrl}/api/project/getprojects`);
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
        return this.http.get<Array<Facility>>(`${environment.apiUrl}/api/project/getproperties`);
    }

    getTowns(): Observable<Array<Facility>> {
        return this.http.get<Array<Facility>>(`${environment.apiUrl}/api/facility/gettowns`);
    }

    getBuildingByTown(town): Observable<Array<Facility>> {
        return this.http.get<Array<Facility>>(`${environment.apiUrl}/api/facility/getbuildings/${town}`);
    }
}

