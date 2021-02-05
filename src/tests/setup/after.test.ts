import { after } from 'mocha'
import Injector from '../../injector'

after(async function () {
  await (await Injector.database.connection).connection.close()
})
