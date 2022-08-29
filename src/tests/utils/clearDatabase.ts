import { getConnection } from "typeorm";
import { ConsultantEntity } from "../../database/entities/IConsultant";
import { ConsumerEntity } from "../../database/entities/IConsumer";
import { GeneratorEntity } from "../../database/entities/IGenerator";
import { UserEntity } from "../../database/entities/IUser";

export async function clearDatabase() {
  await getConnection().getRepository(ConsultantEntity).delete({})
  await getConnection().getRepository(ConsumerEntity).delete({})
  await getConnection().getRepository(GeneratorEntity).delete({})
  await getConnection().getRepository(UserEntity).delete({})
}
