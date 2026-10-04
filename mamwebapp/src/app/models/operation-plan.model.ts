export class OperationPlan {
    id: Number;
    userImmovableAssetManagementPlanId: Number;
    templeteNumber: Number;
    districtRegion: String;
    town: String;
    serviceDescription?: String;
    budgetType?: String;
    localMunicipality: String;
    assetDescription: String;
    repairDescription: String;
    priorityServiceRanking: String;
    initialNeedYearObj: any;
    priorityServiceRankingObj: any;
    streetDescription?: String;
    propertyDescription?: String;
    leaseType?: String;
    noofParkingBays?: Number;
    usableSpace?: Number;
    constructionArea?: Number;
    extentofLand?: Number;
    leaseStartDate? : Date;
    leaseEndDate?: Date
    rentalPM?: Number;
    rentalPA?: Number;
    initialNeedYear?: Number;
    status?: String;
    totalAmountRequired?: number;
    cashFlowYear1?: number;
    cashFlowYear2?: number;
    cashFlowYear3?: number;
    cashFlowYear4?: number;
    cashFlowYear5?: number;
    comment?: String;
    leased?: boolean;
}

