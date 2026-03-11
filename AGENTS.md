# Agent Guidelines

This backend is built using the smoke-trees ecosystem, specifically leveraging `@smoke-trees/postgres-backend` (based on node-postgres-backend-core) and `@smoke-trees/smoke-context` for a robust, scalable Node.js application with PostgreSQL.

## Architecture Overview

- **Framework**: Express.js with TypeScript
- **ORM**: TypeORM for database interactions
- **Database**: PostgreSQL
- **Dependency Injection**: Inversify for IoC container
- **Documentation**: Swagger UI for API documentation
- **Testing**: Mocha with Chai for unit and integration tests
- **Logging**: Winston-based logging via smoke-context
- **Context Management**: Request-scoped context with user authentication

## Coding Conventions

### Variable Naming

- Use camelCase for variable names in code
- Example: `userId`, `firstName`, `isActive`

### Database Column Naming

- Always use snake_case for database column names
- Example: `user_id`, `first_name`, `is_active`
- Column names have to be added manually in typeorm column decorator in snake case only.
- Make sure to always add the appropriate column type to the decorator along with nullable and default values.
- Example: `@Column({ type: 'varchar', name: 'user_id'})` for `userId: string`, `@Column({ type: 'boolean', name: 'is_active', default: true})` for `isActive: boolean`, `@Column({ type: 'varchar', name: 'first_name', nullable: true})` for `firstName?: string`
- The `id` field will always be a `PrimaryGeneratedColumn` of UUID type unless you specify otherwise.
- The `id` field in the interface will always be optional

### TypeScript Conventions

- Use `camelCase` for variable names
- Use `PascalCase` for interface and class names
- Use `PascalCase` for enum values
- Use `camelCase` for function names
- Use `camelCase` for method names
- Use `camelCase` for property names
- Avoid using `any` at all costs
- Prioritize typescript inference over explicit type declarations but declare types for variables that are not inferred correctly

## Project Structure

- `src/`: Main source code
  - `index.ts`: Application entry point, sets up Express app, middleware, and controllers
  - `database.ts`: Database configuration and entity registration
  - `setup.ts`: Dependency injection container setup
  - `settings.ts`: Application configuration extending postgres-backend Settings
  - `log.ts`: Logger export from postgres-backend
  - `types.ts`: Global type definitions and smoke-context extensions
  - `app/`: Application-specific code
    - `migrations/`: TypeORM migrations
    - `tests/`: Test files
- `sql/`: Database scripts and queries

## File Generation

- Use the `generate.sh` script to generate template files for new entities
- Command: `./generate.sh EntityName [path]`
- Path is optional, if not provided, the entity will be generated in the `./src/app/` directory. If provided, the files will be generated in the provided path relative to the script location.
- Generates:
  - `IEntityName.ts`: Interface definition
  - `EntityName.entity.ts`: TypeORM entity class
  - `EntityName.dao.ts`: Data Access Object to interact with the database.
  - `EntityName.service.ts`: Business logic service
  - `EntityName.controller.ts`: REST API controller
- Automatically updates `database.ts` and `setup.ts` to register the new entity

## Logging

- Use the `log` object from the `smoke-context` package for all logging operations
- Scan for any `console.*` call. Every occurrence is an error — no exceptions.
- Never use `console.log` directly
- The logger is configured via postgres-backend and supports structured logging
- All the logs should be in the format `log.[type]([log message], [class name][function name], [object for and parameters needed])`
- Error logs will be in the format `log.error([log message], [class name][function name], error, [object for and parameters needed])`
- Use `log.error` for errors only (inside the catch block) and `log.warn` for unhappy paths inside a function (early returns)
- Examples:
  - `log.info('Informational message', 'ClassName.functionName', {key: 'value'})`
  - `log.error('Error occurred', 'ClassName.functionName', error, {key: 'value'})`
  - `log.debug('Debug information', 'ClassName.functionName', {key: 'value'})`
  - `log.warn('Warning message', 'ClassName.functionName', {key: 'value'})`

## Context and Authentication

- Each request has a context object attached via smoke-context
- Context includes `userId` for authenticated requests
- Access context in controllers/services via `request.context`

## Database Operations

- Use TypeORM entities extending `BaseEntity` from postgres-backend
- DAOs extend `Dao<T>` for CRUD operations.
- Services extend `Service<T>` for business logic
- Controllers extend `ServiceController<T>` for REST endpoints
- The `Dao` class is abstract and had pre-written methods for CRUD operations.
- The `ServiceController` class is abstract and had pre-written routes for CRUD operations.
- Only use the database object if what you are trying to do is not supported by the existing dao

## Testing

- Tests are located in `src/tests/`
- Use Mocha framework with Chai assertions
- Database is connected before tests run
- Utility functions in `src/tests/utils/` for test setup/teardown

## Configuration

- Environment variables are loaded via `config-env.ts`
- Settings class in `settings.ts` handles configuration
- Supports PostgreSQL connection parameters via env vars

## API Documentation

- Swagger documentation is auto-generated from TypeORM decorators
- Available at `/docs` endpoint
- Use `@Documentation.addSchema()` and `@Documentation.addField()` decorators

## Development Workflow

1. Use `generate.sh` to create new entities
2. Implement business logic in services
3. Add routes and validation in controllers
4. Write tests for new functionality
5. Run migrations for database schema changes
6. Use `npm run dev` for development with hot reload

## Function Rules
- All Functions should return `Result` or `ResultWithCount` object from `@smoke-trees/postgres-backend` package.
- The first parameter is boolean indicatinf if there's an error.
- The second parameter is error code of `ErrorCode` enum from the same package.
- The Third parameter is the message indicating what the error is.
- The fourth parameter is the response of the function
- All functions should be writted inside try catch block.
- All catch block will log the error using `log.error` and return the `Result` object.
- Avoid explicit Return types in functions, typescript will infer the return type

## Dao Functions
- `read` function to read single entry from the database. Defaults to `id` field but can be passed a where clause using `{where: {field: value}}` object.
- `readMany` function to read multiple entries from the database
- `create` function to create a new entry in the database
- `update` function to update an existing entry in the database
- `delete` function to delete an existing entry from the database

## Result Object
- Use `result.status.error` to check if there's an error
- Use `result.status.code` to check the error code
- Use `result.message` to check the error message
- Use `result.result` to get the data returned by the function
- Use `result.count` to get the count of the data returned by the function


### General Docs
Docs: [https://github.com/smoke-trees/node-template-ts/wiki](https://github.com/smoke-trees/node-template-ts/wiki)
