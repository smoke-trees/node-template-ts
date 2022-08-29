import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IConsumer } from "../../app/IConsumer";
import { ICustomField } from "../../app/ICustomField";
import BaseEntity from "./BaseEntity";

@Entity({ name: 'consumer', schema: 'benefits' })
export class ConsumerEntity extends BaseEntity implements IConsumer {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string

    @Column({ name: 'employee_id', type: 'varchar', nullable: false })
    name!: string;

    @Column({ name: 'quantum_consumed', type: 'float8', nullable: false })
    quantumConsumed!: number;

    @Column({ name: 'custom_fields', type: 'json', nullable: true })
    customFields?: ICustomField[] | undefined;

    constructor(data: IConsumer) {
        super();
        this.name = data.name;
        this.quantumConsumed = data.quantumConsumed;
        this.customFields = data.customFields ?? [];
        if (data.id) {
            this.id = data.id;
        }
    }
}