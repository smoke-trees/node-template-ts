import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../app'
import { describe, it } from 'mocha'

chai.use(chaiHttp)
describe('# Test suite', function () {
  it('# Test description', async function () {
    const res = await chai.request(app).get('/')
    chai.assert.equal(res.body.user, 'none')
  })
})
