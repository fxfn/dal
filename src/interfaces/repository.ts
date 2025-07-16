import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core"
import { SQL } from "drizzle-orm"

// Base repository interface with explicit type parameters
export interface IRepository<TSelect, TInsert> {
  create(data: TInsert): Promise<TSelect>
  update(id: string, data: Partial<TInsert>): Promise<TSelect>
  delete(id: string): Promise<boolean>
  getBy(filter?: SQL): Promise<TSelect[]>
  getAll(): Promise<TSelect[]>
  get(id: string): Promise<TSelect>
  getCustom?(id: string): Promise<any>
}

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