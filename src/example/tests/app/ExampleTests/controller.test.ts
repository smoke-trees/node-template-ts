import { Application, ErrorCode } from '@smoke-trees/postgres-backend'
import * as chai from 'chai'
import { assert } from 'chai'
import chaiHttp, { request } from 'chai-http'
import { container } from '../../../setup'
import { clearUserTable } from '../../utils/clear-database.test'

chai.use(chaiHttp)

export function ExampleControllerTest() {
	const app = container.get(Application)
	describe('Example controller test', async function () {
		this.beforeEach(async function () {
			await clearUserTable(app.database!)
		})
		it('Create User', async function () {
			const response = await request.execute(app.getApp()).post('/user').send({ name: 'Anshuman' })
			assert.equal(response.status, 201)
			assert.exists(response.body)
			assert.exists(response.body.result)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.Created)
			assert.isFalse(response.body.status.error)
		})
		it('Create User - No name parameter', async function () {
			const response = await request.execute(app.getApp()).post('/user').send({ name1: 'Anshuman' })
			assert.equal(response.status, 400)
			assert.exists(response.body)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.BadRequest)
			assert.isTrue(response.body.status.error)
		})
		it('Read User', async function () {
			const createResponse = await request
				.execute(app.getApp())
				.post('/user')
				.send({ name: 'Anshuman' })
			const response = await request
				.execute(app.getApp())
				.get(`/user/${createResponse.body.result}`)
			assert.equal(response.status, 200)
			assert.exists(response.body)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.Success)
			assert.isFalse(response.body.status.error)
			assert.equal(response.body.result.name, 'Anshuman')
		})
		it('Read User - Not Found', async function () {
			const createResponse = await request
				.execute(app.getApp())
				.post('/user')
				.send({ name: 'Anshuman' })
			const response = await request
				.execute(app.getApp())
				.get(`/user/${createResponse.body.result}1`)
			assert.equal(response.status, 404)
			assert.exists(response.body)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.NotFound)
			assert.isTrue(response.body.status.error)
		})
		it('Update User', async function () {
			const createResponse = await request
				.execute(app.getApp())
				.post('/user')
				.send({ name: 'Anshuman' })
			const updateResponse = await request
				.execute(app.getApp())
				.put(`/user/${createResponse.body.result}`)
				.send({ name: 'Anshuman1' })
			assert.equal(updateResponse.status, 200)
			assert.exists(updateResponse.body)
			assert.exists(updateResponse.body.status)
			assert.equal(updateResponse.body.status.code, ErrorCode.Success)
			assert.isFalse(updateResponse.body.status.error)
			const response = await request
				.execute(app.getApp())
				.get(`/user/${createResponse.body.result}`)
			assert.equal(response.status, 200)
			assert.exists(response.body)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.Success)
			assert.isFalse(response.body.status.error)
			assert.equal(response.body.result.name, 'Anshuman1')
		})
		it('Update User - not found', async function () {
			const createResponse = await request
				.execute(app.getApp())
				.post('/user')
				.send({ name: 'Anshuman' })
			const updateResponse = await request
				.execute(app.getApp())
				.put(`/user/${createResponse.body.result}1`)
				.send({ name: 'Anshuman1' })
			assert.equal(updateResponse.status, 404)
			assert.exists(updateResponse.body)
			assert.exists(updateResponse.body.status)
			assert.equal(updateResponse.body.status.code, ErrorCode.NotFound)
			assert.isTrue(updateResponse.body.status.error)
			const response = await request
				.execute(app.getApp())
				.get(`/user/${createResponse.body.result}`)
			assert.equal(response.status, 200)
			assert.exists(response.body)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.Success)
			assert.isFalse(response.body.status.error)
			assert.equal(response.body.result.name, 'Anshuman')
		})
		it('Delete User - not found', async function () {
			const createResponse = await request
				.execute(app.getApp())
				.post('/user')
				.send({ name: 'Anshuman' })
			const updateResponse = await request
				.execute(app.getApp())
				.delete(`/user/${createResponse.body.result}1`)
				.send({ name: 'Anshuman1' })
			assert.equal(updateResponse.status, 404)
			assert.exists(updateResponse.body)
			assert.exists(updateResponse.body.status)
			assert.equal(updateResponse.body.status.code, ErrorCode.NotFound)
			assert.isTrue(updateResponse.body.status.error)
			const response = await request
				.execute(app.getApp())
				.get(`/user/${createResponse.body.result}`)
			assert.equal(response.status, 200)
			assert.exists(response.body)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.Success)
			assert.isFalse(response.body.status.error)
			assert.equal(response.body.result.name, 'Anshuman')
		})
		it('Delete User ', async function () {
			const createResponse = await request
				.execute(app.getApp())
				.post('/user')
				.send({ name: 'Anshuman' })
			const updateResponse = await request
				.execute(app.getApp())
				.delete(`/user/${createResponse.body.result}`)
				.send({ name: 'Anshuman1' })
			assert.equal(updateResponse.status, 200)
			assert.exists(updateResponse.body)
			assert.exists(updateResponse.body.status)
			assert.equal(updateResponse.body.status.code, ErrorCode.Success)
			assert.isFalse(updateResponse.body.status.error)
			const response = await request
				.execute(app.getApp())
				.get(`/user/${createResponse.body.result}`)
			assert.equal(response.status, 404)
			assert.exists(response.body)
			assert.exists(response.body.status)
			assert.equal(response.body.status.code, ErrorCode.NotFound)
			assert.isTrue(response.body.status.error)
		})
		it('Read Many - Pages', async function () {
			for (let i = 0; i < 12; i++) {
				await request
					.execute(app.getApp())
					.post('/user')
					.send({ name: `Anshuman${i}` })
			}
			const result1 = await request
				.execute(app.getApp())
				.get(`/user?count=5&orderBy=name&order=asc`)
			assert.equal(result1.status, 200)
			assert.isFalse(result1.body.status.error)
			assert.equal(result1.body.result.length, 5)
			assert.equal(result1.body.status.code, ErrorCode.Success)
			assert.equal(result1.body.result[0].name, 'Anshuman0')
			const result2 = await request
				.execute(app.getApp())
				.get(`/user?page=2&count=5&orderBy=name&order=asc`)
			assert.equal(result2.status, 200)
			assert.isFalse(result2.body.status.error)
			assert.equal(result2.body.result.length, 5)
			assert.equal(result2.body.status.code, ErrorCode.Success)
			assert.equal(result2.body.result[0].name, 'Anshuman3')
			const result3 = await request
				.execute(app.getApp())
				.get(`/user?page=3&count=5&orderBy=name&order=asc`)
			assert.equal(result3.status, 200)
			assert.isFalse(result3.body.status.error)
			assert.equal(result3.body.result.length, 2)
			assert.equal(result3.body.status.code, ErrorCode.Success)
			const result4 = await request
				.execute(app.getApp())
				.get(`/user?page=4&count=5&orderBy=name&order=asc`)
			assert.equal(result4.status, 200)
			assert.isFalse(result4.body.status.error)
			assert.equal(result4.body.status.code, ErrorCode.Success)
		})
		it('Read Many - Filter', async function () {
			const users = []
			for (let i = 0; i < 12; i++) {
				users.push(
					await request
						.execute(app.getApp())
						.post('/user')
						.send({ name: `Anshuman${i}` })
				)
			}
			const result1 = await request
				.execute(app.getApp())
				.get(`/user?count=5&orderBy=name&order=asc&name=Anshuman0`)
			assert.equal(result1.status, 200)
			assert.isFalse(result1.body.status.error)
			assert.equal(result1.body.result.length, 1)
			assert.equal(result1.body.status.code, ErrorCode.Success)
			assert.equal(result1.body.result[0].name, 'Anshuman0')
			const result2 = await request
				.execute(app.getApp())
				.get(
					`/user?count=5&orderBy=name&order=asc&name=Anshuman0&name=Anshuman1&id=${users[0].body.result}&id=${users[2].body.result}`
				)
			assert.equal(result2.status, 200)
			assert.isFalse(result2.body.status.error)
			assert.equal(result2.body.result.length, 1)
			assert.equal(result2.body.status.code, ErrorCode.Success)
			assert.equal(result2.body.result[0].name, 'Anshuman0')
		})
		it('Read Many - NonPaginated', async function () {
			const users = []
			for (let i = 0; i < 12; i++) {
				users.push(
					await request
						.execute(app.getApp())
						.post('/user')
						.send({ name: `Anshuman${i}` })
				)
			}
			const result1 = await request
				.execute(app.getApp())
				.get(`/user?nonPaginated=true&orderBy=name&order=asc`)
			assert.equal(result1.status, 200)
			assert.isFalse(result1.body.status.error)
			assert.equal(result1.body.result.length, 12)
			assert.equal(result1.body.status.code, ErrorCode.Success)
		})
	})
}
