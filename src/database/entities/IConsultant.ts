import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IConsultant } from "../../app/IConsultant";
import { ICustomField } from "../../app/ICustomField";
import BaseEntity from "./BaseEntity";

@Entity({ name: 'consultant', schema: 'benefits' })
export class ConsultantEntity extends BaseEntity implements IConsultant {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string

    @Column({ name: 'employee_id', type: 'varchar', nullable: false })
    name!: string;

    @Column({ name: 'custom_fields', type: 'json', nullable: true })
    customFields?: ICustomField[] | undefined;

    constructor(data: IConsultant) {
        super();
        this.name = data.name;
        this.customFields = data.customFields ?? [];
        if (data.id) {
            this.id = data.id;
        }
    }
}