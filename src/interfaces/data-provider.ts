import { createPgDb, createSqliteDb } from "../index"

export const DataProviderDatabaseURL = Symbol.for('DataProviderDatabaseURL')

// PostgreSQL specific interface
export abstract class IPgDataProvider<T extends Record<string, unknown>> {
  abstract db: ReturnType<typeof createPgDb<T>>
  abstract schema: T
  abstract migrate(): Promise<void>
}

// SQLite specific interface
export abstract class ISqliteDataProvider<T extends Record<string, unknown>> {
  abstract db: ReturnType<typeof createSqliteDb<T>>
  abstract schema: T
  abstract migrate(): Promise<void>
}