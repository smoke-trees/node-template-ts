import { Database, ErrorCode } from "@smoke-trees/postgres-backend";
import { assert } from "chai";
import { UserService } from "../../../app/users";
import { clearUserTable } from "../../utils/clear-database.test";


export function ExampleServiceTest(database: Database, userService: UserService) {
  describe("User service test", async function () {
    this.beforeEach(function () {
      clearUserTable(database)
    })
    it("Should create a new User", async function () {
      const user = await userService.create({ name: 'Anshuman' })
      assert.equal(user.status.code, ErrorCode.Created)
      assert.isFalse(user.status.error)
      assert.exists(user.result)
    })
    it("Should read a user", async function () {
      const user = await userService.create({ name: 'Anshuman' })
      const userRead = await userService.readOne(user.result!)
      assert.equal(userRead.status.code, ErrorCode.Success)
      assert.isFalse(userRead.status.error)
      assert.exists(userRead.result)
      assert.equal(userRead.result?.name, 'Anshuman')
    })
    it("Should read all user", async function () {
      for (let i = 0; i < 12; i++) {
        await userService.create({ name: 'Anshuman1' })
      }
      const userRead1 = await userService.readMany()
      assert.equal(userRead1.status.code, ErrorCode.Success)
      assert.isFalse(userRead1.status.error)
      assert.exists(userRead1.result)
      assert.equal(userRead1.result?.length, 10)

      const userRead2 = await userService.readMany(2)
      assert.equal(userRead2.status.code, ErrorCode.Success)
      assert.isFalse(userRead2.status.error)
      assert.exists(userRead2.result)
      assert.equal(userRead2.result?.length, 2)

      const userRead3 = await userService.readManyWithoutPagination()
      assert.equal(userRead3.status.code, ErrorCode.Success)
      assert.isFalse(userRead3.status.error)
      assert.exists(userRead3.result)
      assert.equal(userRead3.result?.length, 12)
    })
    it("Should update a user", async function () {
      const user = await userService.create({ name: 'Anshuman' })
      const userUpdate = await userService.update(user.result!, { name: 'Anshuman1' })
      assert.equal(userUpdate.status.code, ErrorCode.Success)
      assert.isFalse(userUpdate.status.error)
      assert.exists(userUpdate.result)
      const userRead = await userService.readOne(user.result!)
      assert.equal(userRead.status.code, ErrorCode.Success)
      assert.isFalse(userRead.status.error)
      assert.exists(userRead.result)
      assert.equal(userRead.result?.name, 'Anshuman1')
    })
    it("Should delete a user", async function () {
      const user = await userService.create({ name: 'Anshuman' })
      const userDelete = await userService.delete(user.result!)
      assert.equal(userDelete.status.code, ErrorCode.Success)
      assert.isFalse(userDelete.status.error)
      assert.exists(userDelete.result)
      const userRead = await userService.readOne(user.result!)
      assert.equal(userRead.status.code, ErrorCode.NotFound)
      assert.isTrue(userRead.status.error)
    })
  })
}