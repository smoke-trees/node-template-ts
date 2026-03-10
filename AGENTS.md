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
  - `EntityName.dao.ts`: Data Access Object
  - `EntityName.service.ts`: Business logic service
  - `EntityName.controller.ts`: REST API controller
- Automatically updates `database.ts` and `setup.ts` to register the new entity

## Logging

- Use the `log` object from the `smoke-context` package for all logging operations
- Avoid using `console.log` directly
- The logger is configured via postgres-backend and supports structured logging
- Examples:
  - `log.info('Informational message')`
  - `log.error('Error occurred')`
  - `log.debug('Debug information')`
  - `log.warn('Warning message')`

## Context and Authentication

- Each request has a context object attached via smoke-context
- Context includes `userId` for authenticated requests
- Access context in controllers/services via `request.context`

## Database Operations

- Use TypeORM entities extending `BaseEntity` from postgres-backend
- DAOs extend `Dao<T>` for CRUD operations
- Services extend `Service<T>` for business logic
- Controllers extend `ServiceController<T>` for REST endpoints

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
