import Application from "../core/app"
import database from "../database/database"
import chai from 'chai'
import chaiHttp from 'chai-http'
import { clearDatabase } from "./utils/clearDatabase"
import { UserService } from "../app/User/UserService"
import { GeneratorService } from "../app/Generator/GeneratorService"
import { ConsumerService } from "../app/Consumer/ConsumerService"
import { ConsultantService } from "../app/Consultant/ConsultantService"
import { ServicesTest } from "./app/index.test"

chai.use(chaiHttp)

function InitializeServices() {
  const generatorService = new GeneratorService()
  const consumerService = new ConsumerService()
  const consultantService = new ConsultantService()
  const userService = new UserService()

    return {
        generatorService,
        consumerService,
        consultantService,
        userService
    }
}

describe('Altilium-ERP test suite', async function () {
  const app = new Application()
  const Services = InitializeServices()
//   const employeeController = new EmployeeController(app, Services.employeeService)
//   const employeesController = new EmployeesController(app, Services.employeeService)
//   const companyController = new CompanyController(app, Services.companyService)

//   app.addController(employeeController)
//   app.addController(employeesController)
//   app.addController(companyController)



  this.beforeAll(async function () {
    this.timeout(10000)
    app.loadControllers()
    await database.ready
    console.log(database.ready)
    // await delay(1000)
  })
  this.beforeEach(async function () {
    await clearDatabase()
  })
  ServicesTest(app, Services)
})