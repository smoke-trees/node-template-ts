import Application from "../../core/app";
import { ConsultantServiceTest } from "./consultant.test";
import { ConsumerServiceTest } from "./consumer.test";
import { GeneratorServiceTest } from "./generator.test";
import { UserServiceTest } from "./user.test";

export function ServicesTest(app: Application, Services: any): void {
  describe("Services Test", function () {
    UserServiceTest(Services.userService);
    ConsultantServiceTest(Services.consultantService, Services.consumerService, Services.generatorService);
    ConsumerServiceTest(Services.consumerService);
    GeneratorServiceTest(Services.generatorService);
  })
}
