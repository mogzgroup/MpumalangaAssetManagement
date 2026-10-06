import { User } from "src/app/models/user.model";
import { TempleteFivePointOne } from "./templetes/templete-five-point-one.model";
import { TempleteFivePointThree } from "./templetes/templete-five-point-three.model";
import { TempleteFivePointTwo } from "./templetes/templete-five-point-two.model";
import { TempleteFourPointOne } from "./templetes/templete-four-point-one.model";
import { TempleteFourPointTwo } from "./templetes/templete-four-point-two.model";
import { TempleteOne } from "./templetes/templete-one.model";
import { TempleteSeven } from "./templetes/templete-seven.model";
import { TempleteSix } from "./templetes/templete-six.model";
import { TempleteThree } from "./templetes/templete-three.model";
import { TempleteTwoPointOne } from "./templetes/templete-two-point-one.model";
import { TempleteTwoPointTwo } from "./templetes/templete-two-point-two.model";

export class UAMP {
    id?: number;    
    status?: string;
    fileReference?: string;
    optimalSupportingAccommodationId?: number;
    department?: string;
    createdDate?: Date;
    userId?: number;
    modifiedDate?: Date;
    modifiedBy?: number;
    user?: User;
    templeteOne?: TempleteOne;
    templeteTwoPointOne?: TempleteTwoPointOne;
    templeteTwoPointTwo?: TempleteTwoPointTwo;
    templeteThree?: TempleteThree;
    templeteFourPointOne?: TempleteFourPointOne;
    templeteFourPointTwo?: TempleteFourPointTwo;
    templeteFivePointOne?: TempleteFivePointOne;
    templeteFivePointTwo?: TempleteFivePointTwo;
    templeteFivePointThree?: TempleteFivePointThree;
    templeteSix?: TempleteSix;
    templeteSeven?: TempleteSeven;
}

