import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core"
import { SQL } from "drizzle-orm"

// Base repository interface with explicit type parameters
export abstract class IRepository<TSelect, TInsert> {
  abstract create(data: TInsert): Promise<TSelect>
  abstract update(id: string, data: Partial<TInsert>): Promise<TSelect>
  abstract delete(id: string): Promise<boolean>
  abstract getBy(filter?: SQL): Promise<TSelect[]>
  abstract getAll(): Promise<TSelect[]>
  abstract get(id: string): Promise<TSelect>
  abstract getCustom?(id: string): Promise<any>
}

// Type to extract only tables from a mixed schema
export type ExtractTables<T> = {
  [K in keyof T]: T[K] extends SQLiteTableWithColumns<any> ? T[K] : never
}

// Type to get table keys only
export type TableKeys<T> = {
  [K in keyof T]: T[K] extends SQLiteTableWithColumns<any> ? K : never
}[keyof T]

// Helper types for extracting entity types from a repository
export type Entity<T> = T extends IRepository<infer TSelect, any> ? TSelect : never
export type NewEntity<T> = T extends IRepository<any, infer TInsert> ? TInsert : never
export type UpdateEntity<T> = T extends IRepository<any, infer TInsert> ? Partial<TInsert> : never

// Type to extract model types from a Drizzle table
export type InferSelectModel<T> = T extends SQLiteTableWithColumns<any> 
  ? T['$inferSelect']
  : never

export type InferInsertModel<T> = T extends SQLiteTableWithColumns<any> 
  ? T['$inferInsert']
  : never