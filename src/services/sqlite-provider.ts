import { ISqliteDataProvider } from "../interfaces/data-provider"
import { createSqliteDb } from "../index"
import { inject } from "@fxfn/inject"
import { type Logger } from "drizzle-orm"
import { RepoDatabaseLogging, RepoDatabaseUrl, RepoSchema } from "../constants"

export class SqliteDataProvider<T extends Record<string, unknown>> implements ISqliteDataProvider<T> {
  private _db: ReturnType<typeof createSqliteDb<T>>

  @inject(RepoDatabaseUrl)
  databaseUrl!: string

  @inject(RepoDatabaseLogging)
  databaseLogging!: boolean | Logger

  @inject(RepoSchema)
  schema!: T

  constructor() {
    this._db = createSqliteDb(this.databaseUrl, this.schema, this.databaseLogging)
  }

  get db(): ReturnType<typeof createSqliteDb<T>> {
    return this._db
  }

  async migrate(): Promise<void> {
    // SQLite migrations would be handled here
    // This is a placeholder implementation
    throw new Error('SQLite migrations not implemented yet')
  }
} 