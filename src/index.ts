import { drizzle as drizzleLibsql } from "drizzle-orm/libsql/node"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { createClient } from "@libsql/client"
import { Pool } from "pg"
import { Logger } from "drizzle-orm"

export function createSqliteDb<TSchema extends Record<string, unknown>>(url: string, schema: TSchema, logger?: boolean | Logger) {
  const client = createClient({ url })
  const result = drizzleLibsql({ client, schema, logger })
  return result
}

export function createPgDb<TSchema extends Record<string, unknown>>(url: string, schema: TSchema, logger?: boolean | Logger) {
  const pool = new Pool({ connectionString: url })
  const result = drizzlePg({ client: pool, schema, logger })
  return result
}

// Core exports
export * from "./interfaces/data-provider"
export * from "./interfaces/repository"
export * from "./services/pg-repository"
export * from "./errors"

// Database providers
export * from "./services/sqlite-provider"
export * from "./services/pg-provider"

// Constants
export * from "./constants"