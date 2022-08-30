import { IConsumer } from "../Consumer/IConsumer";
import { IGenerator } from "../Generator/IGenerator";
import { IBase } from "../IBase";
import { ICustomField } from "../ICustomField";

export interface IConsultant extends IBase {
    id?: string;
    name: string;
    consumers?: IConsumer[];
    generators?: IGenerator[];
    customFields?: ICustomField[];
}