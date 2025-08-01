import { IPgDataProvider } from "../interfaces/data-provider"
import { createPgDb } from "../index"
import { inject } from "@fxfn/inject"
import { type Logger } from "drizzle-orm"
import { RepoDatabaseLogging, RepoDatabaseUrl, RepoSchema } from "../constants"

export class PgDataProvider<T extends Record<string, unknown>> implements IPgDataProvider<T> {
  private _db: ReturnType<typeof createPgDb<T>>

  @inject(RepoDatabaseUrl)
  databaseUrl!: string

  @inject(RepoDatabaseLogging)
  databaseLogging!: boolean | Logger

  @inject(RepoSchema)
  schema!: T

  constructor() {
    this._db = createPgDb(this.databaseUrl, this.schema, this.databaseLogging)
  }

  get db(): ReturnType<typeof createPgDb<T>> {
    return this._db
  }

  async migrate(): Promise<void> {
    // PostgreSQL migrations would be handled here
    // This is a placeholder implementation
    throw new Error('PostgreSQL migrations not implemented yet')
  }
} 