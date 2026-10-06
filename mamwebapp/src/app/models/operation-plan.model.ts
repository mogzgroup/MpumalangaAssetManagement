export class OperationPlan {
    id: number;
    userImmovableAssetManagementPlanId: number;
    templeteNumber: number;
    districtRegion: string;
    town: string;
    serviceDescription?: string;
    budgetType?: string;
    localMunicipality: string;
    assetDescription: string;
    repairDescription: string;
    priorityServiceRanking: string;
    initialNeedYearObj: any;
    priorityServiceRankingObj: any;
    streetDescription?: string;
    propertyDescription?: string;
    leaseType?: string;
    noofParkingBays?: number;
    usableSpace?: number;
    constructionArea?: number;
    extentofLand?: number;
    leaseStartDate? : Date;
    leaseEndDate?: Date
    rentalPM?: number;
    rentalPA?: number;
    initialNeedYear?: number;
    status?: string;
    totalAmountRequired?: number;
    cashFlowYear1?: number;
    cashFlowYear2?: number;
    cashFlowYear3?: number;
    cashFlowYear4?: number;
    cashFlowYear5?: number;
    comment?: string;
    leased?: boolean;
}

