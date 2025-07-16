import { drizzle } from "drizzle-orm/libsql/node"
import { createClient } from "@libsql/client"

export function createDb<TSchema extends Record<string, unknown>>(url: string, schema: TSchema) {
  const client = createClient({ url })
  const result = drizzle({ client, schema, logger: true })
  return result
}

export * from "./interfaces/data-provider"
export * from "./errors"

export * as sqlite from "./lib/sqlite"
export * as pg from "./lib/pg"