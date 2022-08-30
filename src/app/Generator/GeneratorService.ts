import { GeneratorEntity } from "../../database/entities/Generator";
import { IGenerator } from "./IGenerator";

export class GeneratorService {
    async createGenerator(generator: IGenerator) {
        var generatorEntity = new GeneratorEntity(generator);
        return await generatorEntity.create();
    }
}