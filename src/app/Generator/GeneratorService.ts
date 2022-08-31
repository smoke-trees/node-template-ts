import { ConsultantEntity } from "../../database/entities/Consultant";
import { GeneratorEntity } from "../../database/entities/Generator";
import { Result } from "../../IResult";
import { IGenerator } from "./IGenerator";

export class GeneratorService {
    async createGenerator(generator: IGenerator) {
        var generatorEntity = new GeneratorEntity(generator);
        return await generatorEntity.create();
    }

    async attachToConsultant(consultantId: string, generatorId: string): Promise<Result<any>> {
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