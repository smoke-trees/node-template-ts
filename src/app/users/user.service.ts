import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { Service } from "../../core/Service";
import { UserDoa } from "./user.dao";
import { User } from "./user.entity";

export class UserService extends Service<User> {
  doa: UserDoa;
  constructor(userDoa: UserDoa) {
    super(userDoa)
    this.doa = userDoa
  }
}