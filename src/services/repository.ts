import { inject } from "@fxfn/inject"
import { MissingDataProviderError, RecordNotFoundError } from "@fxfn/dal"
import { ExtractTables, IRepository, TableKeys } from "../interfaces/repository"
import { IDataProvider } from "../interfaces/data-provider"
import { and, eq, sql, SQL } from "drizzle-orm"

export class BaseRepository<
  TSchema extends Record<string, any>,
  TKey extends TableKeys<TSchema> & string,
  TTable extends ExtractTables<TSchema>[TKey] = ExtractTables<TSchema>[TKey]
> implements IRepository<TTable['$inferSelect'], TTable['$inferInsert']> {
  protected readonly tableName: TKey
  readonly schema: TTable

  @inject(IDataProvider)
  protected db!: IDataProvider<ExtractTables<TSchema>>

  constructor(fullSchema: TSchema, tableName: TKey) {
    this.schema = fullSchema[tableName] as TTable
    this.tableName = tableName
    
    if (this.db === undefined) {
      throw new MissingDataProviderError(`${this.constructor.name} requires an IDataProvider to be registered`)
    }
  }

  protected get query() {
    return (this.db.query as any)[this.tableName]
  }

  async create(data: TTable['$inferInsert']): Promise<TTable['$inferSelect']> {
    const result = await this.db.insert(this.schema).values(data as any).returning().get()
    await this.onCreate(result as TTable['$inferSelect'])
    return result as TTable['$inferSelect']
  }

  protected async onCreate(result: TTable['$inferSelect']): Promise<void> {
    // Hook for subclasses
  }

  async update(id: string, data: Partial<TTable['$inferInsert']>): Promise<TTable['$inferSelect']> {
    const result = await this.db.update(this.schema)
      .set(data as any)
      .where(eq((this.schema as any).id, id))
      .returning()
      .get()

    await this.onUpdate(result as TTable['$inferSelect'])
    return result as TTable['$inferSelect']
  }

  protected async onUpdate(result: TTable['$inferSelect']): Promise<void> {
    // Hook for subclasses
  }

  async delete(id: string): Promise<boolean> {
    const entity = await this.get(id)
    if (!entity) {
      throw new RecordNotFoundError(`${this.tableName} with id '${id}' not found`)
    }

    let result: TTable['$inferSelect'] | undefined
    if ('isdeleted' in this.schema) {
      result = await this.db.update(this.schema)
        .set({
          isdeleted: true,
          deletedat: new Date()
        })
        .where(eq((this.schema as any).id, id))
        .returning()
        .get()
    }
    else {
      result = await this.db.delete(this.schema)
        .where(
          eq(this.schema.id, id)
        )
        .returning()
        .get()
    }
      
    if (result) {
      await this.onDelete(result as TTable['$inferSelect'])
    }
    
    return !!result
  }

  protected async onDelete(result: TTable['$inferSelect']): Promise<void> {
    // Hook for subclasses
  }

  async getBy(filter?: SQL): Promise<TTable['$inferSelect'][]> {
    return await this.query.findMany({
      where: and(
        filter ?? undefined,
        'isdeleted' in this.schema ? eq((this.schema as any).isdeleted, false) : sql`1=1`
      )
    }) as TTable['$inferSelect'][]
  }

  async getAll(): Promise<TTable['$inferSelect'][]> {
    return await this.db.select()
      .from(this.schema)
      .where(
        'isdeleted' in this.schema ? eq((this.schema as any).isdeleted, false) : sql`1=1`
      ) as TTable['$inferSelect'][]
  }

  async get(id: string): Promise<TTable['$inferSelect']> {
    if (this.query?.findFirst) {
      return await this.query.findFirst({
        where: and(
          eq((this.schema as any).id, id), 
          'isdeleted' in this.schema ? eq((this.schema as any).isdeleted, false) : sql`1=1`
        )
      }) as TTable['$inferSelect']
    }

    const result = await this.db.select()
      .from(this.schema)
      .where(and(
        eq((this.schema as any).id, id), 
        'isdeleted' in this.schema ? eq((this.schema as any).isdeleted, false) : sql`1=1`
      ))
      .get()
    
    return result as TTable['$inferSelect']
  }
}

export { BaseRepository as Repository }

// Factory function for convenience
export function createRepository<
  TSchema extends Record<string, any>,
  TKey extends TableKeys<TSchema> & string
>(schema: TSchema, tableName: TKey) {
  return BaseRepository<TSchema, TKey> as new () => BaseRepository<TSchema, TKey>
}