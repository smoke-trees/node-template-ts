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
}