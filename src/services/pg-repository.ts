import { inject } from "@fxfn/inject"
import { MissingDataProviderError, RecordNotFoundError } from "../errors"
import { ExtractTables, IRepository, TableKeys } from "../interfaces/repository"
import { IPgDataProvider } from "../interfaces/data-provider"
import { and, eq, sql, SQL } from "drizzle-orm"

// Base repository for PostgreSQL
export class PgRepository<
  TSchema extends Record<string, any>,
  TKey extends TableKeys<TSchema> & string,
  TTable extends ExtractTables<TSchema>[TKey] = ExtractTables<TSchema>[TKey]
> implements IRepository<TTable['$inferSelect'], TTable['$inferInsert']> {
  protected readonly tableName: TKey
  readonly schema: TTable

  @inject(IPgDataProvider)
  protected dataProvider!: IPgDataProvider<ExtractTables<TSchema>>

  constructor(fullSchema: TSchema, tableName: TKey) {
    this.schema = fullSchema[tableName] as TTable
    this.tableName = tableName
    
    if (this.dataProvider === undefined) {
      throw new MissingDataProviderError(`${this.constructor.name} requires a PostgreSQL DataProvider to be registered`)
    }
  }

  async create(data: TTable['$inferInsert']): Promise<TTable['$inferSelect']> {
    const result = await this.dataProvider.db.insert(this.schema).values(data).returning()
    const firstResult = Array.isArray(result) ? result[0] : result
    await this.onCreate(firstResult as TTable['$inferSelect'])
    return firstResult as TTable['$inferSelect']
  }

  protected async onCreate(result: TTable['$inferSelect']): Promise<void> {
    // Hook for subclasses
  }

  async update(id: string, data: Partial<TTable['$inferInsert']>): Promise<TTable['$inferSelect']> {
    const result = await this.dataProvider.db.update(this.schema)
      .set({
        ...data,
        updatedat: new Date()
      })
      .where(eq(this.schema.id, id))
      .returning()

    const firstResult = Array.isArray(result) ? result[0] : result
    await this.onUpdate(firstResult as TTable['$inferSelect'])
    return firstResult as TTable['$inferSelect']
  }

  protected async onUpdate(result: TTable['$inferSelect']): Promise<void> {
    // Hook for subclasses
  }

  async delete(id: string): Promise<boolean> {
    const entity = await this.get(id)
    if (!entity) {
      throw new RecordNotFoundError(`${this.tableName} with id '${id}' not found`)
    }

    let result: unknown
    if ('isdeleted' in this.schema) {
      result = await this.dataProvider.db.update(this.schema)
        .set({
          isdeleted: true,
          deletedat: new Date()
        })
        .where(eq(this.schema.id, id))
        .returning()
    }
    else {
      result = await this.dataProvider.db.delete(this.schema)
        .where(eq(this.schema.id, id))
        .returning()
    }
      
    const hasResult = Array.isArray(result) ? result.length > 0 : !!result
    if (hasResult) {
      const firstResult = Array.isArray(result) ? result[0] : result
      await this.onDelete(firstResult as TTable['$inferSelect'])
    }
    
    return hasResult
  }

  protected async onDelete(result: TTable['$inferSelect']): Promise<void> {
    // Hook for subclasses
  }

  async getBy(filter?: SQL): Promise<TTable['$inferSelect'][]> {
    const result = await this.dataProvider.db.select()
      .from(this.schema)
      .where(and(
        filter ?? undefined,
        'isdeleted' in this.schema ? eq(this.schema.isdeleted, false) : sql`1=1`
      ))
    return Array.isArray(result) ? result as TTable['$inferSelect'][] : [result] as TTable['$inferSelect'][]
  }

  async getAll(): Promise<TTable['$inferSelect'][]> {
    const result = await this.dataProvider.db.select()
      .from(this.schema)
      .where(
        'isdeleted' in this.schema ? eq(this.schema.isdeleted, false) : sql`1=1`
      )
    return Array.isArray(result) ? result as TTable['$inferSelect'][] : [result] as TTable['$inferSelect'][]
  }

  async get(id: string): Promise<TTable['$inferSelect']> {
    const result = await this.dataProvider.db.select()
      .from(this.schema)
      .where(and(
        eq(this.schema.id, id), 
        'isdeleted' in this.schema ? eq(this.schema.isdeleted, false) : sql`1=1`
      ))
      .limit(1)
    
    const firstResult = Array.isArray(result) ? result[0] : result
    return firstResult as TTable['$inferSelect']
  }
}