export class SurrenderPlan{
    id: number;
    userImmovableAssetManagementPlanId: number;
    strategicAssessmentId?: number;
    propertyId?: number;
    district: string;
    town: string;
    localMunicipality: string;
    currentStreetAddress: string;
    assetType: string;      
    propertyDescription: string;
    allocatedLettableSpace?: number;
    extentofLand?: number;
    surrenderRationale: string;
    proposedHandOverDate?: Date;
    contractualObligations: string;
    relinquish: boolean;
}

