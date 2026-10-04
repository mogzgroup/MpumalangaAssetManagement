import { MtefYear } from "./mtef-year.model";

export class MtefBudgetPeriod {
    id: Number;
    userImmovableAssetManagementPlanId: Number;
    order: number;
    isHeader: boolean;
    isPercentage: boolean;
    title: string;
    group: string;
    year1Allocation: number;
    year1RequiredBudget: number;
    year1Shortfall: number;
    year2Allocation: number;
    year2RequiredBudget: number;
    year2Shortfall: number;
    year3Allocation: number;
    year3RequiredBudget: number;
    year3Shortfall: number;
    year4Allocation: number;
    year4RequiredBudget: number;
    year4Shortfall: number;
    year5Allocation: number;
    year5RequiredBudget: number;
    year5Shortfall: number;
}

