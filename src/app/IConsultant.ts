import { IBase } from "./IBase";
import { ICustomField } from "./ICustomField";

export interface IConsultant extends IBase {
    id?: string;
    name: string;
    customFields?: ICustomField[];
}