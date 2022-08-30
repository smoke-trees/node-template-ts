import { ConsultantEntity } from "../../database/entities/Consultant";
import { ConsumerEntity } from "../../database/entities/Consumer";
import { GeneratorEntity } from "../../database/entities/Generator";
import { Result } from "../../IResult";
import { IConsultant } from "./IConsultant";

export class ConsultantService {
    async createConsultant(Consultant: IConsultant): Promise<Result<string>> {
        var consultantEntity = new ConsultantEntity(Consultant);
        return await consultantEntity.create();
    }

    async addConsumer(consultantId: string, consumerId: string): Promise<Result<any>> {
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

    async addGenerator(consultantId: string, generatorId: string): Promise<Result<any>> {
        var consultantEntity = await ConsultantEntity.read<ConsultantEntity>(consultantId);
        if (consultantEntity.error.error) {
            return consultantEntity;
        }
        var generatorEntity = await GeneratorEntity.read<GeneratorEntity>(generatorId);
        if (generatorEntity.error.error) {
            return generatorEntity;
        }
        generatorEntity.result!.consultant = consultantEntity.result!;

        var updatedGenerator = await generatorEntity.result!.update(generatorId);
        return updatedGenerator;
    }
}