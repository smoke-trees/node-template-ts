import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IGenerator } from "../../app/IGenerator";
import { ICustomField } from "../../app/ICustomField";
import BaseEntity from "./BaseEntity";

@Entity({ name: 'generator', schema: 'benefits' })
export class GeneratorEntity extends BaseEntity implements IGenerator {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string

    @Column({ name: 'employee_id', type: 'varchar', nullable: false })
    name!: string;

    @Column({ name: 'quantum_generated', type: 'float8', nullable: false })
    quantumGenerated!: number;

    @Column({ name: 'custom_fields', type: 'json', nullable: true })
    customFields?: ICustomField[] | undefined;

    constructor(data: IGenerator) {
        super();
        this.name = data.name;
        this.quantumGenerated = data.quantumGenerated;
        this.customFields = data.customFields ?? [];
        if (data.id) {
            this.id = data.id;
        }
    }
}