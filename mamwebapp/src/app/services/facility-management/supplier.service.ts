import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectSupplier } from 'src/app/models/project-supplier';
import { Supplier } from 'src/app/models/supplier';
import { environment } from 'src/environments/environment';
import { cachedGet } from '../../helpers/http-cache';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private http = inject(HttpClient);


    getSuppliers(): Observable<Supplier[]> {
        return cachedGet<Supplier[]>(this.http, `${environment.apiUrl}/api/supplier/getsuppliers`);
    }

    linkProjectSuppliers(suppliers: ProjectSupplier[]) {
        return this.http.post<ProjectSupplier[]>(`${environment.apiUrl}/api/supplier/addsuppliers`, suppliers);
    }

    addSupplier(supplier: Supplier) {
        return this.http.post<number>(`${environment.apiUrl}/api/supplier/addsupplier`, supplier);
    }

    updateSupplier(supplier: Supplier) {
        return this.http.post<boolean>(`${environment.apiUrl}/api/supplier/updatesupplier`, supplier);
    }
    deleteSupplier(supplier: Supplier) {
        return this.http.post<boolean>(`${environment.apiUrl}/api/supplier/deletesupplier`, supplier);
    }
}
