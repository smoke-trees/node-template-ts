import { assert } from "chai";
import { ConsultantService as ConsultantServiceClass} from "../../app/Consultant/ConsultantService";
import { GeneratorService as GeneratorServiceClass } from "../../app/Generator/GeneratorService";
import { ErrorCodes } from "../../IResult";

export function GeneratorServiceTest(GeneratorService: GeneratorServiceClass, ConsultantService: ConsultantServiceClass): void { 
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

    it("Attach to Consultant", async function () {
        const result = await ConsultantService.createConsultant({
            name: "Consultant 1",
        });
        assert.isFalse(result.error.error);
        assert.equal(result.error.code, ErrorCodes.Success, 'Consultant creation error')

        const result2 = await GeneratorService.createGenerator({
            name: "Generator 1",
            quantumGenerated: 10,
        });
        assert.isFalse(result2.error.error);
        assert.equal(result2.error.code, ErrorCodes.Success, 'Generator creation error')

        const result3 = await GeneratorService.attachToConsultant(result.result!, result2.result!);
        assert.isFalse(result3.error.error);
        assert.equal(result3.error.code, ErrorCodes.Success, 'Consultant add generator error')
    });
}

