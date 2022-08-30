import { assert } from "chai";
import { GeneratorService as GeneratorServiceClass } from "../../app/Generator/GeneratorService";
import { ErrorCodes } from "../../IResult";

export function GeneratorServiceTest(GeneratorService: GeneratorServiceClass): void { 
    describe("Generator Service Test", function () {
        it("Create Generator", async function () {
            const result = await GeneratorService.createGenerator({
                name: "Generator 1",
                quantumGenerated: 10,
            });
            assert.isFalse(result.error.error);
            assert.equal(result.error.code, ErrorCodes.Success, 'Generator creation error')
        });
    });
}

