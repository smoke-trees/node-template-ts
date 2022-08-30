import { ConsumerEntity } from "../../database/entities/Consumer";
import { IConsumer } from "./IConsumer";

export class ConsumerService {
    async createConsumer(Consumer: IConsumer) {
        var consumerEntity = new ConsumerEntity(Consumer);
        return await consumerEntity.create();
    }
}