import { ConsultantEntity } from "../../database/entities/Consultant";
import { Result } from "../../IResult";
import { IConsultant } from "./IConsultant";

export class ConsultantService {
    async createConsultant(Consultant: IConsultant): Promise<Result<string>> {
        var consultantEntity = new ConsultantEntity(Consultant);
        return await consultantEntity.create();
    }

    async getConsultant(id: string) {
        return await ConsultantEntity.read<ConsultantEntity>(id);
    }

    async deleteConsultant(id: string) {
        return await ConsultantEntity.delete<ConsultantEntity>(id);
    }

    async updateConsultant(consultant: Partial<ConsultantEntity>) {
        const consultantToEdit = await ConsultantEntity.read<ConsultantEntity>(consultant.id);
        if (consultantToEdit.error.error) {
            return consultantToEdit;
        } else {
            const entity: ConsultantEntity = consultantToEdit.result!;
            entity.name = consultant.name ? consultant.name : entity.name;
            entity.customFields = consultant.customFields ? consultant.customFields : entity.customFields;
            const updateResult = await entity.update(entity.id);
            return updateResult;
        }
    }
}