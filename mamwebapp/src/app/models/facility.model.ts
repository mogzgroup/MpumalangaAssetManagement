
export class Facility {
    id: number;
    name: string;
    fileReference: string;
    type: string;
    clientCode: string;    
    survey: string;
    afs: string;
    //vestedType: string;
    userDepartment: string;
    userId: number;
    status: string;    
    land: Land;
    finance: Finance;
    improvements: Improvement[];
    capturerId: string;
    createdDate: Date;
    modifierId: string;
    modifiedDate: Date;
    approvedBy: string;
    approvedDate: Date;
    singedOffBy: string;
    singedOffDate: Date;
}

export class Land {
    id: number;
    class: string;
    type: string;
    geographicalLocation: GeographicalLocation;   
    propertyDescription: PropertyDescription;
    landUseManagementDetail: LandUseManagementDetail;
    leaseStatus: LeaseStatus;
}

export class Improvement {
    id: number;
    buildingName: string;
    type: string;
    size: string;
    potentialUse: string;
    siteCoverag: string;
    levelofUtilization: string;
    extentOfBuilding: string;
    conditionRating: string;
    usableArea: string;
    functionalPerformanceRating: string;
    comment: string;
};

export class GeographicalLocation{
    id: number;
    province: string;
    town: string;
    suburb: string;
    streetName: string;
    streetNumber: number;
    districtMunicipality: string;
    region: string;
    localAuthority: string;
    latitude: string;
    longitude: string; 
    magisterialDistrict: string;
}

export class PropertyDescription{ 
    id: number;  
    registrationDivision: string;
    townshipName: string;
    landParcel: string;
    landPortion: string;
    oldDescription: string;
    landRemainder: boolean;
    farmName: string;
    sGDiagramNumber: number;
    extent: number;
    LPICode: string;
    acquired: string;
    acquiredOther: string;  
}

export class LandUseManagementDetail{
    id: number;
    titleDeedNumber: string;
    deedsOffice: string;
    registrationDate: Date;
    registeredOwner: string;
    vestingDate: Date;
   // conditionsOfTitle: string;
    ownershipCategory: string;
    stateOwnedPercentage: number;
    landUse: string;
    zoning: string;
    userDepartment: string;
    facilityName: string; 
    incomeLeaseStatus: string;
}

export class LeaseStatus{
    id: number;    
    natureOfLease: string;
    iDNumberCompanyRegistrationNumber: number;
    pOBox: string;
    contactNumber: string;
    capacityofContactPerson: string;
    contactPerson: string;
    postalCode: number;
    leaseStatusTown: string;
    rentalAmount: number;
    terminationDate: Date;
    startingDate: Date;
    occupationDate: Date;
    escalation: string;
    vat: string;
    leaseNumber: number;
    otherCharges: number;
}

export class Finance {    
    id: number;
    landUseClass: string;
    natureofAsset: string;
    secondaryInformationNote: SecondaryInformationNote;
    valuation: Valuation;
}

export class SecondaryInformationNote { 
    openingBalance: number;
    additionCash: number;
    additionNonCash: number;
    addition: number;
    disposal: number;
    closingBalance: number;
}

export class Valuation { 
    municipalValuationDate: Date;
    nonMunicipalValuationDate: Date;
    municipalValuation: string;
    nonMunicipalValuation: string;
    propetyRatesAccount: string;
    value: string;
    accountNoForService: string;
    personInstitutionResposible: string;
}


