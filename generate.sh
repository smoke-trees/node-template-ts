lowercase=$(echo "$1" | tr '[:upper:]' '[:lower:]')
path=${2:-'./src/app/'}
snakecase=$(echo "$1" | sed -r 's/([a-z0-9])([A-Z])/\1_\L\2/g' | tr '[:upper:]' '[:lower:]')
kebabcase=$(echo "$1" | sed -r 's/([a-z0-9])([A-Z])/\1-\L\2/g' | tr '[:upper:]' '[:lower:]')
relpath=$(echo "$path" | sed "s|/src/|/|g")

mkdir "$path$1"
touch "$path$1/I$1.ts"

echo "export interface I$1 {
    id: string;
}" > "$path$1/I$1.ts"
echo "
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend';
import { I$1 } from './I$1';

@Documentation.addSchema()
@Entity({ name: '$snakecase' })
export class $1 extends BaseEntity implements I$1 {
    @Documentation.addField({ type: 'string' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    constructor(data?: I$1) {
        super();
        if(data) {
          if(data.id) this.id = data.id;
        }
    }
}" > "$path$1/$1.entity.ts"

echo "
import { Dao, Database } from '@smoke-trees/postgres-backend';
import { inject } from 'inversify'
import { $1 } from './$1.entity';

export class $1Dao extends Dao<$1> {
    constructor(
        @inject('database')
        db: Database
    ) {
        super(db, $1, '$snakecase');
    }
}
" > "$path$1/$1.dao.ts"

echo "
import { Service } from '@smoke-trees/postgres-backend';
import { $1Dao } from './$1.dao';
import { $1 } from './$1.entity';
import { inject } from 'inversify'

export class $1Service extends Service<$1> {
    dao: $1Dao;
    constructor(
        @inject($1Dao)
        dao: $1Dao
    ) {
        super(dao);
        this.dao = dao;
    }
}
" > "$path$1/$1.service.ts"

echo "
import { Application, Controller, ServiceController } from '@smoke-trees/postgres-backend';
import { $1 } from './$1.entity';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs'; 
import { $1Service } from './$1.service';
import { inject } from 'inversify'

export class $1Controller extends ServiceController<$1> {
    path: string = '/$kebabcase';
    protected controllers: Controller[] = [];
    protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = [];
    service: $1Service;
    constructor(
        @inject(Application)
        app: Application, 
        @inject($1Service)
        service: $1Service
    ) {
        super(app, $1, service)
        this.service = service;
        this.addRoutes();
        this.loadDocumentation();
        this.loadMiddleware();
    }
}
" > "$path$1/$1.controller.ts"



sed -i "/^import settings from '.\/settings'/a\import { $1 } from '$relpath\/$1\/$1.entity'" ./src/database.ts
sed -i "/^\/\/ Add Entities/a\database.addEntity($1)" ./src/database.ts 

sed -i "/^import settings from '.\/settings'/a\import { $1Dao } from '$relpath\/$1\/$1.dao'" ./src/setup.ts
sed -i "/^import settings from '.\/settings'/a\import { $1Service } from '$relpath\/$1\/$1.service'" ./src/setup.ts
sed -i "/^import settings from '.\/settings'/a\import { $1Controller } from '$relpath\/$1\/$1.controller'" ./src/setup.ts

sed -i "/^container.bind(Application).toConstantValue(app)/a\container.bind($1Controller).toSelf()" ./src/setup.ts
sed -i "/^container.bind(Application).toConstantValue(app)/a\container.bind($1Service).toSelf()" ./src/setup.ts
sed -i "/^container.bind(Application).toConstantValue(app)/a\ \ncontainer.bind($1Dao).toSelf()" ./src/setup.ts

npx prettier . --write
