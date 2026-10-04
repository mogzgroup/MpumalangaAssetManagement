import { User } from "./user.model";

export class HiredProperty {
    id: number
    type: string;
    district: string;
    propertyCode: string;
    buildingCondition: string;
    startingDate: Date;
    terminationDate: Date;
    monthlyRental: number;   
    startRentalAmount: number; 
    town: string;
    status: string;
    userDepartment: string;
    landlandAgentName: string;
    landlandAgentContactDetails: string;
    numberofStaff: number;
    escalationRate: number;
    escalationDate: Date;
    area: number;
    address: string;
    createdByUser: User;
    createdUserId: number;
    createdDate: Date;
    modifiedByUser?: User;
    modifiedUserId?: number;
    isDeleted: boolean;
    modifiedDate?: Date;
    latitude: string;
    longitude: string
}
