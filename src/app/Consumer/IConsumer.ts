import { IBase } from "../IBase";
import { ICustomField } from "../ICustomField";

export interface IConsumer extends IBase {
    id?: string;
    name: string;
    quantumConsumed: number;
    consultantId?: string;
    customFields?: ICustomField[];
}