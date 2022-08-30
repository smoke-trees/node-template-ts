import { IBase } from "../IBase";
import { ICustomField } from "../ICustomField";

export interface IGenerator extends IBase {
    id?: string;
    name: string;
    quantumGenerated: number;
    consultantId?: string;
    customFields?: ICustomField[];
}