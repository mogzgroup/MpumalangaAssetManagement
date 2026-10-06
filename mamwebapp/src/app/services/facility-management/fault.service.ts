import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Fault } from 'src/app/models/fault.model';
import { environment } from 'src/environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
    providedIn: 'root'
})
export class FaultService {
    private http = inject(HttpClient);


    getFaults(): Observable<Fault[]> {
        return cachedGet<Fault[]>(this.http, `${environment.apiUrl}/api/fault/getfaults`);
    }

    addFault(fault: Fault) {
        return this.http.post<number>(`${environment.apiUrl}/api/fault/addfault`, fault);
    }

    updateFault(fault: Fault) {
        return this.http.post<boolean>(`${environment.apiUrl}/api/fault/updatefault`, fault);
    }

    deleteFault(fault: Fault) {
        return this.http.post<boolean>(`${environment.apiUrl}/api/fault/deletefault`, fault);
    }

    getFaultReferenceNo(referenceNo: string) {
        return cachedGet<Fault>(this.http, `${environment.apiUrl}/api/fault/getfaultbyreferenceno/${referenceNo}`);
    }

    uploadFiles(files: any, fileName: string) {
        const formData: FormData = new FormData();

        if (files.length > 0) {
            files.forEach( file => {
                formData.append('file', file, file.name);
              });
        } else {
            formData.append('file', files, files.name);
        }

        const header = new HttpHeaders({
            'enctype': 'multipart/form-data',
            'Accept': 'application/json'
          });
        return this.http.post<Fault>(`${environment.apiUrl}/api/fault/uploadFiles/` + fileName, formData, { headers: header });
      }

      getFiles(fileReference: string) {
        return this.http.get<any[]>(`${environment.apiUrl}/api/fault/getFiles/` + fileReference);
      }
}
