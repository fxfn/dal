import { createDb } from "@fxfn/dal"

export const DataProviderDatabaseURL = Symbol.for('DataProviderDatabaseURL')

export abstract class IDataProvider<T extends Record<string, unknown>> {

  abstract db: ReturnType<typeof createDb<T>>

  abstract query: typeof this.db['query']
  abstract insert: typeof this.db['insert']
  abstract select: typeof this.db['select']
  abstract update: typeof this.db['update']
  abstract delete: typeof this.db['delete']
  abstract get: typeof this.db['get']
  abstract run: typeof this.db['run']

  abstract schema: T
  abstract migrate(): Promise<void>
}