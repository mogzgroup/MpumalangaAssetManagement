import { ProjectSupplier } from "./project-supplier";
import { Supplier } from "./supplier";

export class Project {
    id: number;
    orderNumber: string;
    district: string;
    propertyId: number;
    name: string;
    plannedDuration: string;
    startDate: Date;
    practicalCompletionDate: Date;
    scopeofWork: string;
    hasFinancials: boolean;
    hasParentProject: boolean;
    parentProjectId?: number;
    amount?: number;
    account?: number;
    managedBy: string;
    employeeName: string;
    employeeNumber?: number;
    contactName: string;
    contactNumber: string;
    businessName: string;
    businessRegNumber: string;
    createdDate: Date;
    modifiedDate?: Date;
    projectSuppliers: Array<ProjectSupplier>;
    status: string;
    isDeleted: boolean;
}

