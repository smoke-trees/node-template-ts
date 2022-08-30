import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IConsultant } from "../../app/Consultant/IConsultant";
import { ICustomField } from "../../app/ICustomField";
import BaseEntity from "./BaseEntity";
import { ConsumerEntity } from "./Consumer";
import { GeneratorEntity } from "./Generator";

@Entity({ name: 'consultant', schema: 'altilium-erp' })
export class ConsultantEntity extends BaseEntity implements IConsultant {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string

    @Column({ name: 'name', type: 'varchar', nullable: false })
    name!: string;

    @OneToMany(() => ConsumerEntity, (consumer) => consumer.consultant, {
        cascade: ['remove', 'soft-remove', 'update']
    })
    consumers!: ConsumerEntity[];

    @OneToMany(() => GeneratorEntity, (generator) => generator.consultant, {
        cascade: ['remove', 'soft-remove', 'update']
    })
    generators!: GeneratorEntity[];

    @Column({ name: 'custom_fields', type: 'json', nullable: true })
    customFields?: ICustomField[] | undefined;

    constructor(data: IConsultant) {
        super();
        if (data) {
            this.name = data.name;
            this.customFields = data.customFields ?? [];
            if (data.id) {
                this.id = data.id;
            }
        }
    }
}