import { assert } from "chai";
import { ConsumerService as ConsumerServiceClass } from "../../app/Consumer/ConsumerService";
import { ErrorCodes } from "../../IResult";

export function ConsumerServiceTest(ConsumerService: ConsumerServiceClass): void {
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
}

