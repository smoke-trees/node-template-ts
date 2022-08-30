import Application from "../../core/app";
import { ConsultantServiceTest } from "./consultant.test";
import { ConsumerServiceTest } from "./consumer.test";
import { GeneratorServiceTest } from "./generator.test";
import { UserServiceTest } from "./user.test";

export function ServicesTest(app: Application, Services: any): void {
  describe("Services Test", function () {
    UserServiceTest();
    ConsultantServiceTest(Services.consultantService, Services.consumerService, Services.generatorService);
    ConsumerServiceTest();
    GeneratorServiceTest();
  })
}
