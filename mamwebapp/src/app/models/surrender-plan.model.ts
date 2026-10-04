export class SurrenderPlan{
    id: Number;
    userImmovableAssetManagementPlanId: Number;
    strategicAssessmentId?: number;
    propertyId?: Number;
    district: String;
    town: String;
    localMunicipality: String;
    currentStreetAddress: String;
    assetType: String;      
    propertyDescription: String;
    allocatedLettableSpace?: Number;
    extentofLand?: Number;
    surrenderRationale: String;
    proposedHandOverDate?: Date;
    contractualObligations: String;
    relinquish: boolean;
}

