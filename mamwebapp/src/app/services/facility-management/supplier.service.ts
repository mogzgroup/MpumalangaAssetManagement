import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectSupplier } from 'src/app/models/project-supplier';
import { Supplier } from 'src/app/models/supplier';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {

    constructor(private http: HttpClient) { }

    getSuppliers(): Observable<Array<Supplier>> {
        return this.http.get<Array<Supplier>>(`${environment.apiUrl}/api/supplier/getsuppliers`);
    }

    linkProjectSuppliers(suppliers: Array<ProjectSupplier>) {
        return this.http.post<Array<ProjectSupplier>>(`${environment.apiUrl}/api/supplier/addsuppliers`, suppliers);
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

