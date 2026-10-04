import { User } from "./user.model";

export class ConditionAssessment {
    id: number;
    facilityId: number;
    rates: Array<Rate>;
    createdDate: Date;
    createdBy: number;
    modifiedDate: Date;
    modifiedBy: number;
    creator: User;
    displayName?: string;
    date?: string; 
    color?: string
}

export class Rate {
    key: number;
    value: number;
    name: string;
}
