import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm"
import { sqliteTable } from "drizzle-orm/sqlite-core";

import {
  text,
  unique,
  integer,
  index,
  uniqueIndex,
  customType,
} from "drizzle-orm/sqlite-core"

export const table = sqliteTable

export { text, unique, integer, index, uniqueIndex, customType }

export const boolean = (columnName: string) => {
  return integer(columnName, { mode: 'boolean' })
}

export const date = (columnName: string) => {
  return integer(columnName, { mode: 'timestamp_ms' })
}

export function dateDefaultNow(columnName: string) {
  return integer(columnName, { mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`)
}

export function id(prefix?: string) {
  return text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(
      () => [prefix, createId()].filter(Boolean).join('_')
    )
}

export const entity = (prefix: string) => ({
  id: id(prefix ?? ''),
  createdat: dateDefaultNow('created_at'),
  updatedat: date('updated_at'),
  isdeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  deletedat: date('deleted_at'),
})