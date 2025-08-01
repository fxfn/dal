# DAL Package

A Data Access Layer (DAL) package that provides type-safe database operations for both PostgreSQL and SQLite using Drizzle ORM.

## Features

- **Multi-database support**: PostgreSQL and SQLite
- **Type-safe operations**: Full TypeScript support with inferred types
- **Repository pattern**: Clean abstraction over database operations
- **Dependency injection**: Built-in support for @fxfn/inject
- **Soft deletes**: Automatic handling of soft delete operations

## Installation

```bash
npm install @fxfn/dal
```

## Quick Start

### 1. Define Your Schema

```typescript
import { pg } from '@fxfn/dal'

const schema = {
  users: pg.table('users', {
    id: pg.id('user'),
    name: pg.text('name').notNull(),
    email: pg.text('email').notNull().unique(),
    ...pg.entity('user')
  })
}
```

### 2. Create a Data Provider

#### PostgreSQL Provider

```typescript
import { PgDataProvider } from '@fxfn/dal'

class MyPgDataProvider extends PgDataProvider<typeof schema> {
  constructor() {
    super()
  }
}
```

#### SQLite Provider

```typescript
import { SqliteDataProvider } from '@fxfn/dal'

class MySqliteDataProvider extends SqliteDataProvider<typeof schema> {
  constructor() {
    super()
  }
}
```

### 3. Create a Repository

#### PostgreSQL Repository

```typescript
import { PgRepository } from '@fxfn/dal'

export class UsersRepository extends PgRepository<typeof schema, 'users'> {
  constructor() {
    super(schema, 'users')
  }

  // Custom methods
  async findByEmail(email: string) {
    return await this.getBy(eq(this.schema.email, email))
  }
}
```

#### SQLite Repository

```typescript
import { SqliteRepository } from '@fxfn/dal'

export class UsersRepository extends SqliteRepository<typeof schema, 'users'> {
  constructor() {
    super(schema, 'users')
  }

  // Custom methods
  async findByEmail(email: string) {
    return await this.getBy(eq(this.schema.email, email))
  }
}
```

### 4. Set Up Dependency Injection

```typescript
import { Container } from '@fxfn/inject'
import { PgDataProvider, SqliteDataProvider } from '@fxfn/dal'

const container = new Container()

// Register the appropriate data provider
container.register(PgDataProvider, () => new MyPgDataProvider())
// OR for SQLite:
// container.register(SqliteDataProvider, () => new MySqliteDataProvider())

// Register your repository
container.register(UsersRepository, () => new UsersRepository())
```

## Available Methods

Both `PgRepository` and `SqliteRepository` provide the following methods:

### CRUD Operations

- `create(data)`: Create a new record
- `get(id)`: Get a single record by ID
- `getAll()`: Get all records (respects soft deletes)
- `getBy(filter)`: Get records with a filter
- `update(id, data)`: Update a record
- `delete(id)`: Delete a record (soft delete if `isdeleted` column exists)

### Lifecycle Hooks

Override these methods in your repository for custom logic:

- `onCreate(result)`: Called after creating a record
- `onUpdate(result)`: Called after updating a record
- `onDelete(result)`: Called after deleting a record

## Type Safety

The repositories provide full type safety with Drizzle's inferred types:

```typescript
// These types are automatically inferred from your schema
type User = typeof schema.users.$inferSelect
type NewUser = typeof schema.users.$inferInsert

// Repository methods return properly typed results
const user: User = await usersRepository.get('user_123')
const users: User[] = await usersRepository.getAll()
```

## Error Handling

The package includes custom error classes:

- `MissingDataProviderError`: Thrown when no data provider is registered
- `RecordNotFoundError`: Thrown when a record is not found

## Migration Support

Both data providers include a `migrate()` method for handling database migrations:

```typescript
class MyPgDataProvider extends PgDataProvider<typeof schema> {
  async migrate(): Promise<void> {
    // Implement your migration logic here
    // Example: await this.db.migrate()
  }
}
```

## Examples

### Complex Queries

```typescript
export class OrdersRepository extends PgRepository<typeof schema, 'orders'> {
  async getActiveOrders() {
    return await this.getBy(
      and(
        eq(this.schema.status, 'active'),
        eq(this.schema.isdeleted, false)
      )
    )
  }
}
```

### Custom Business Logic

```typescript
export class ProductsRepository extends SqliteRepository<typeof schema, 'products'> {
  async createProduct(data: NewProduct) {
    const product = await this.create(data)
    
    // Custom business logic
    await this.onProductCreated(product)
    
    return product
  }

  private async onProductCreated(product: Product) {
    // Send notifications, update inventory, etc.
  }
}
```

## Factory Functions

For convenience, you can use factory functions to create repositories:

```typescript
import { createPgRepository, createSqliteRepository } from '@fxfn/dal'

const UsersRepository = createPgRepository(schema, 'users')
const usersRepo = new UsersRepository()
```

## Legacy Support

For backward compatibility, the package exports:

- `BaseRepository`: Alias for `PgRepository`
- `Repository`: Alias for `PgRepository`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT 