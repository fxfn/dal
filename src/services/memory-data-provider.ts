import { resolve } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator"
import { createDb, schema } from "../";
import { IDataProvider } from "../interfaces/data-provider";

export class MemoryDataProvider implements IDataProvider<typeof schema> {

  db = createDb(':memory:', schema)

  query = this.db.query
  insert = this.db.insert.bind(this.db)
  select = this.db.select.bind(this.db)
  update = this.db.update.bind(this.db)
  delete = this.db.delete.bind(this.db)
  get = this.db.get.bind(this.db)
  run = this.db.run.bind(this.db)
  schema = schema

  async migrate(): Promise<void> {
    const migrationsFolder = resolve(import.meta.dirname, '../../migrations')
    await migrate(this.db, { 
      migrationsFolder, 
      migrationsTable: 'migrations' 
    })
  }
}