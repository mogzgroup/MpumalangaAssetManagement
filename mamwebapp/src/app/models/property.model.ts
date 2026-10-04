import { MunicipalUtilityService } from "./municipal-utility-service.model";

export class Property{
    id: Number;
    userImmovableAssetManagementPlanId: Number;
    userDepartmentCode?: string;
    fileReferenceNo: string;
    serialNo: string;
    district: string;
    districtRegion: string;
    town: string;
    localMunicipality: string;
    localAuthority?: string;
    assetDescription: string;
    oldStreetAddress: string;
    currentStreetAddress: string;
    propertyDescription: string;
    assetType: string;
    noofParkingBays?: number;
    noofParkingBaysAllocated?: number;
    usableAllocatedSpace?: number;
    lettableSpace?: number;
    extentofLand?: number;
    rentalRate?: number;
    rentalPM?: number;
    rentalPA?: number;
    municipalUtilityServices?: Array<MunicipalUtilityService>
    MunicipalUtilityServiceTotal?: number;
    propertyRatesTaxes?: Number;
    operationalCosts?: number;
    requiredPerformanceStandard: string;
    accessibility: string;
    conditionRating: string;
    suitabilityIndex: string;
    operatingPerformanceIndex: string;
    functionalPerformanceIndex: string;
    leaseStartDate?: Date;
    leaseEndDate?: Date;
    leaseTerm?: string;
    comment?: string;
    accessibilityObj?: any;
    suitabilityIndexObj?: any;
    operatingPerformanceIndexObj?: any;
    functionalPerformanceIndexObj?: any;
    requiredPerformanceStandardObj?: any;
    conditionRatingObj?: any;
    localMunicipalityObj?: any;
    districtObj?: any;
}

