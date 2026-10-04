import { Role } from "../models/role.model";

export class User {
    id: number;
    username: string;
    password: string;
    name: string;
    surname: string;
    roleId: number;
    role?: Role;
    isActive: boolean;
    email: string;
    passwordIsChanged: boolean;
    createdDate: Date;
    createdUserId: number;
    modifiedDate?: Date;
    modifiedUserId?: number;
    token?: string;
    department: string;
}

