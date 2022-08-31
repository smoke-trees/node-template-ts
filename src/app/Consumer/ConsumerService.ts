import { ConsultantEntity } from "../../database/entities/Consultant";
import { ConsumerEntity } from "../../database/entities/Consumer";
import { Result } from "../../IResult";
import { IConsumer } from "./IConsumer";

export class ConsumerService {
    async createConsumer(Consumer: IConsumer) {
        var consumerEntity = new ConsumerEntity(Consumer);
        return await consumerEntity.create();
    }

    async attachToConsultant(consultantId: string, consumerId: string): Promise<Result<any>> {
        var consultantEntity = await ConsultantEntity.read<ConsultantEntity>(consultantId);
        if (consultantEntity.error.error) {
            return consultantEntity;
        }
        var consumerEntity = await ConsumerEntity.read<ConsumerEntity>(consumerId);
        if (consumerEntity.error.error) {
            return consumerEntity;
        }
        consumerEntity.result!.consultant = consultantEntity.result!;

        var updatedConsumer = await consumerEntity.result!.update(consumerId);
        return updatedConsumer;
    }

    async getConsumer(id: string) {
        return await ConsumerEntity.read<ConsumerEntity>(id);
    }

    async deleteConsumer(id: string) {
        return await ConsumerEntity.delete<ConsumerEntity>(id);
    }

    async updateConsumer(consultant: Partial<ConsumerEntity>) {
        const consultantToEdit = await ConsumerEntity.read<ConsumerEntity>(consultant.id);
        if (consultantToEdit.error.error) {
            return consultantToEdit;
        } else {
            const entity: ConsumerEntity = consultantToEdit.result!;
            entity.name = consultant.name ? consultant.name : entity.name;
            entity.quantumConsumed = consultant.quantumConsumed ? consultant.quantumConsumed : entity.quantumConsumed;
            entity.consultant = consultant.consultant ? consultant.consultant : entity.consultant;
            entity.consultantId = consultant.consultantId ? consultant.consultantId : entity.consultantId;
            entity.customFields = consultant.customFields ? consultant.customFields : entity.customFields;
            const updateResult = await entity.update(entity.id);
            return updateResult;
        }
    }
}