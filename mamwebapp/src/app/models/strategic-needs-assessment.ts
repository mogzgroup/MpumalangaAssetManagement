export class StrategicNeedsAssessment {
    id: number
    postDescription: string;
    allocatedSpace: string;
    surplusShortageAccommodation : string;     
    percentageUtilised: string;
    RequirementTermFilledBudgetedPost: TermRequirement
    RequirementTermApprovedOrganogram: TermRequirement
}

export class TermRequirement{
    level: string;
    quantity: string;
    norm : string;     
    requirement: string;
}

