import { assert } from "chai";
import { ConsultantService as ConsultantServiceClass } from "../../app/Consultant/ConsultantService";
import { ConsumerService as ConsumerServiceClass } from "../../app/Consumer/ConsumerService";
import { GeneratorService as GeneratorServiceClass } from "../../app/Generator/GeneratorService";
import { ErrorCodes } from "../../IResult";

export function ConsultantServiceTest(ConsultantService: ConsultantServiceClass, ConsumerService: ConsumerServiceClass, GeneratorService: GeneratorServiceClass): void {
    describe("Consultant Service Test", function () {
        it("Create Consultant", async function () {
            const result = await ConsultantService.createConsultant({
                name: "Consultant 1",
            });
            assert.isFalse(result.error.error);
            assert.equal(result.error.code, ErrorCodes.Success, 'Consultant creation error')
        });

        it("Add Consumer", async function () {
            const result = await ConsultantService.createConsultant({
                name: "Consultant 1",
            });
            assert.isFalse(result.error.error);
            assert.equal(result.error.code, ErrorCodes.Success, 'Consultant creation error')

            const result2 = await ConsumerService.createConsumer({
                name: "Consumer 1",
                quantumConsumed: 10,
            });
            assert.isFalse(result2.error.error);
            assert.equal(result2.error.code, ErrorCodes.Success, 'Consumer creation error')

            const result3 = await ConsultantService.addConsumer(result.result!, result2.result!);
            assert.isFalse(result3.error.error);
            assert.equal(result3.error.code, ErrorCodes.Success, 'Consultant add consumer error')
        });

        it("Add Generator", async function () {
            const result = await ConsultantService.createConsultant({
                name: "Consultant 1",
            });
            assert.isFalse(result.error.error);
            assert.equal(result.error.code, ErrorCodes.Success, 'Wallet creation error')

            const result2 = await GeneratorService.createGenerator({
                name: "Generator 1",
                quantumGenerated: 10,
            });
            assert.isFalse(result2.error.error);
            assert.equal(result2.error.code, ErrorCodes.Success, 'Generator creation error')

            const result3 = await ConsultantService.addGenerator(result.result!, result2.result!);
            assert.isFalse(result3.error.error);
            assert.equal(result3.error.code, ErrorCodes.Success, 'Consultant add generator error')
        });
    })
}

