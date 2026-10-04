import { LandUseManagementDetail, LeaseStatus } from "./facility.model";

export class LeasedProperty {
    leaseStatusesId: number
    fileReference: string;
    type: string;
    district: string;
    propertyCode: string;
    facilityName: string;
    natureofLease: string;
    startingDate?: Date;
    terminationDate?: Date;
    landId: number;
    landUseManagementDetail: LandUseManagementDetail;
    leaseStatus: LeaseStatus;
}

