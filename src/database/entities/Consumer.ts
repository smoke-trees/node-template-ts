import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IConsumer } from "../../app/Consumer/IConsumer";
import { ICustomField } from "../../app/ICustomField";
import BaseEntity from "./BaseEntity";
import { ConsultantEntity } from "./Consultant";

@Entity({ name: 'consumer', schema: 'altilium-erp' })
export class ConsumerEntity extends BaseEntity implements IConsumer {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string

    @Column({ name: 'name', type: 'varchar', nullable: false })
    name!: string;

    @Column({ name: 'quantum_consumed', type: 'float8', nullable: false })
    quantumConsumed!: number;

    @Column('uuid', { name: 'consultant_id', nullable: true })
    consultantId?: string;

    @ManyToOne(() => ConsultantEntity, (consultant) => consultant.consumers)
    @JoinColumn({ name: 'consultant_id' })
    consultant?: ConsultantEntity;

    @Column({ name: 'custom_fields', type: 'json', nullable: true })
    customFields?: ICustomField[] | undefined;

    constructor(data: IConsumer) {
        super();
        if (data) {
            this.name = data.name;
            this.quantumConsumed = data.quantumConsumed;
            this.customFields = data.customFields ?? [];
            this.consultantId = data.consultantId;
            if (data.id) {
                this.id = data.id;
            }
        }
    }
}