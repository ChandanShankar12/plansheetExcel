import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await db.schema
    .createTable('spreadsheets')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultNow())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultNow())
    .execute();

  await db.schema
    .createTable('columns')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('spreadsheet_id', 'integer', (col) => col.references('spreadsheets.id'))
    .addColumn('column_key', 'varchar(3)', (col) => col.notNull())
    .addColumn('title', 'text')
    .addColumn('width', 'integer', (col) => col.default(80))
    .addColumn('hidden', 'boolean', (col) => col.default(false))
    .addColumn('metadata', 'jsonb', (col) => col.default('{}'))
    .execute();

  await db.schema
    .createTable('rows')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('spreadsheet_id', 'integer', (col) => col.references('spreadsheets.id'))
    .addColumn('row_index', 'integer', (col) => col.notNull())
    .addColumn('title', 'text')
    .addColumn('height', 'integer', (col) => col.default(20))
    .addColumn('hidden', 'boolean', (col) => col.default(false))
    .addColumn('metadata', 'jsonb', (col) => col.default('{}'))
    .execute();

  await db.schema
    .createTable('cells')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('spreadsheet_id', 'integer', (col) => col.references('spreadsheets.id'))
    .addColumn('column_id', 'integer', (col) => col.references('columns.id'))
    .addColumn('row_id', 'integer', (col) => col.references('rows.id'))
    .addColumn('value', 'text')
    .addColumn('formula', 'text')
    .addColumn('style', 'jsonb', (col) => col.default('{}'))
    .addColumn('metadata', 'jsonb', (col) => col.default('{}'))
    .execute();

  await db.schema
    .createTable('merged_cells')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('spreadsheet_id', 'integer', (col) => col.references('spreadsheets.id'))
    .addColumn('start_column_id', 'integer', (col) => col.references('columns.id'))
    .addColumn('start_row_id', 'integer', (col) => col.references('rows.id'))
    .addColumn('end_column_id', 'integer', (col) => col.references('columns.id'))
    .addColumn('end_row_id', 'integer', (col) => col.references('rows.id'))
    .addColumn('value', 'text')
    .addColumn('formula', 'text')
    .addColumn('style', 'jsonb', (col) => col.default('{}'))
    .addColumn('metadata', 'jsonb', (col) => col.default('{}'))
    .execute();
}

export async function down(db: any) {
  await db.schema.dropTable('merged_cells').execute();
  await db.schema.dropTable('cells').execute();
  await db.schema.dropTable('columns').execute();
  await db.schema.dropTable('rows').execute();
  await db.schema.dropTable('spreadsheets').execute();
} 