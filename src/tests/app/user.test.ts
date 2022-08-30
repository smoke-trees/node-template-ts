import { assert } from "chai";
import { UserService as UserServiceClass } from "../../app/User/UserService";
import { ErrorCodes } from "../../IResult";

export function UserServiceTest(UserService: UserServiceClass): void {
    describe("User Service Test", function () {
        it("Create User", async function () {
            const result = await UserService.createUser({
                name: "User 1",
                email: "test@example.org"
            });
            assert.isFalse(result.error.error);
            assert.equal(result.error.code, ErrorCodes.Success, 'User creation error')
        });
    });
}

