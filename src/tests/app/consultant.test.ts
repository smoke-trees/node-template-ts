import { assert } from "chai";
import { ConsultantService as ConsultantServiceClass } from "../../app/Consultant/ConsultantService";
import { ErrorCodes } from "../../IResult";

export function ConsultantServiceTest(ConsultantService: ConsultantServiceClass): void {
    describe("Consultant Service Test", function () {
        it("Create Consultant", async function () {
            const result = await ConsultantService.createConsultant({
                name: "Consultant 1",
            });
            assert.isFalse(result.error.error);
            assert.equal(result.error.code, ErrorCodes.Success, 'Consultant creation error')
        });
    })
}

