import { assert } from "chai";
import { ConsultantService as ConsultantServiceClass} from "../../app/Consultant/ConsultantService";
import { ConsumerService as ConsumerServiceClass } from "../../app/Consumer/ConsumerService";
import { ErrorCodes } from "../../IResult";

export function ConsumerServiceTest(ConsumerService: ConsumerServiceClass, ConsultantService: ConsultantServiceClass): void {
    describe("Consumer Service Test", function () {
        it("Create Consumer", async function () {
            const result = await ConsumerService.createConsumer({
                name: "Consumer 1",
                quantumConsumed: 10,
            });
            assert.isFalse(result.error.error);
            assert.equal(result.error.code, ErrorCodes.Success, 'Consumer creation error')
        });
    });

    it("Attach to Consultant", async function () {
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

        const result3 = await ConsumerService.attachToConsultant(result.result!, result2.result!);
        assert.isFalse(result3.error.error);
        assert.equal(result3.error.code, ErrorCodes.Success, 'Consultant add consumer error')
    });
}

