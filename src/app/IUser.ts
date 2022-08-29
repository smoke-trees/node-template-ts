import { IBase } from "./IBase";
import { ICustomField } from "./ICustomField";

export interface IUser extends IBase {
    id?: string;
    name: string;
    email: string;
    customFields?: ICustomField[];
}