import { getConnection } from "typeorm";
import { ConsultantEntity } from "../../database/entities/Consultant";
import { ConsumerEntity } from "../../database/entities/Consumer";
import { GeneratorEntity } from "../../database/entities/Generator";
import { UserEntity } from "../../database/entities/User";

export async function clearDatabase() {
  await getConnection().getRepository(ConsumerEntity).delete({})
  await getConnection().getRepository(GeneratorEntity).delete({})
  await getConnection().getRepository(ConsultantEntity).delete({})
  await getConnection().getRepository(UserEntity).delete({})
}
