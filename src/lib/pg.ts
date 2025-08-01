import { createId } from "@paralleldrive/cuid2";
import { pgSchema, pgTable } from "drizzle-orm/pg-core";

import {
  text,
  date,
  unique,
  integer,
  boolean,
  index,
  uniqueIndex,
  customType,
  jsonb,
} from "drizzle-orm/pg-core"

export const schema = pgSchema
export const table = pgTable
export const json = jsonb

export { text, date, integer, boolean, index, unique, uniqueIndex, customType }

export function dateDefaultNow(columnName: string) {
  return date(columnName).defaultNow()
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
  isdeleted: boolean('is_deleted').default(false),
  deletedat: date('deleted_at'),
})