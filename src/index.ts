import { drizzle } from "drizzle-orm/libsql/node"
import { createClient } from "@libsql/client"
import { Logger } from "drizzle-orm"

export function createDb<TSchema extends Record<string, unknown>>(url: string, schema: TSchema, logger?: boolean | Logger) {
  const client = createClient({ url })
  const result = drizzle({ client, schema, logger })
  return result
}

export * from "./interfaces/data-provider"
export * from "./errors"
export * from "./interfaces/repository"
export * from "./services/repository"

export * as sqlite from "./lib/sqlite"
export * as pg from "./lib/pg"