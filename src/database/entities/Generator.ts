import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IGenerator } from "../../app/Generator/IGenerator";
import { ICustomField } from "../../app/ICustomField";
import BaseEntity from "./BaseEntity";
import { ConsultantEntity } from "./Consultant";

@Entity({ name: 'generator', schema: 'altilium-erp' })
export class GeneratorEntity extends BaseEntity implements IGenerator {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string

    @Column({ name: 'name', type: 'varchar', nullable: false })
    name!: string;

    @Column({ name: 'quantum_generated', type: 'float8', nullable: false })
    quantumGenerated!: number;

    @Column('uuid', { name: 'consultant_id', nullable: true })
    consultantId?: string;

    @ManyToOne(() => ConsultantEntity, (consultant) => consultant.generators)
    @JoinColumn({ name: 'consultant_id' })
    consultant?: ConsultantEntity;

    @Column({ name: 'custom_fields', type: 'json', nullable: true })
    customFields?: ICustomField[] | undefined;

    constructor(data: IGenerator) {
        super();
        if (data) {
            this.name = data.name;
            this.quantumGenerated = data.quantumGenerated;
            this.customFields = data.customFields ?? [];
            this.consultantId = data.consultantId;
            if (data.id) {
                this.id = data.id;
            }
        }
    }
}