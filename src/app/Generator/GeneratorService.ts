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

    async getGenerator(id: string) {
        return await GeneratorEntity.read<GeneratorEntity>(id);
    }

    async deleteGenerator(id: string) {
        return await GeneratorEntity.delete<GeneratorEntity>(id);
    }

    async updateGenerator(generator: Partial<GeneratorEntity>) {
        const generatorToEdit = await GeneratorEntity.read<GeneratorEntity>(generator.id);
        if (generatorToEdit.error.error) {
            return generatorToEdit;
        } else {
            const entity: GeneratorEntity = generatorToEdit.result!;
            entity.name = generator.name ? generator.name : entity.name;
            entity.quantumGenerated = generator.quantumGenerated ? generator.quantumGenerated : entity.quantumGenerated;
            entity.consultant = generator.consultant ? generator.consultant : entity.consultant;
            entity.consultantId = generator.consultantId ? generator.consultantId : entity.consultantId;
            entity.customFields = generator.customFields ? generator.customFields : entity.customFields;
            const updateResult = await entity.update(entity.id);
            return updateResult;
        }
    }
}