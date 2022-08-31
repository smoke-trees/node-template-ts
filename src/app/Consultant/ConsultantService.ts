import { ConsultantEntity } from "../../database/entities/Consultant";
import { Result } from "../../IResult";
import { IConsultant } from "./IConsultant";

export class ConsultantService {
    async createConsultant(Consultant: IConsultant): Promise<Result<string>> {
        var consultantEntity = new ConsultantEntity(Consultant);
        return await consultantEntity.create();
    }
}