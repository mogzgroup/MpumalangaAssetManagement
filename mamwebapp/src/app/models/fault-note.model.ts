export class FaultNote {
    id: number;
    faultId: number;
    comment: string;
    createdDate: Date;
    modifiedDate?: Date;
    createdById: number;
    modifiedById?: number;
}

