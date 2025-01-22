import { pgTable, serial, text, jsonb, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

// Base table for spreadsheet metadata
export const spreadsheets = pgTable('spreadsheets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Sheets table
export const sheets = pgTable('sheets', {
  id: serial('id').primaryKey(),
  spreadsheetId: integer('spreadsheet_id').references(() => spreadsheets.id),
  name: text('name').notNull(),
  index: integer('index').notNull(), // For sheet order
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Columns table
export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  spreadsheetId: integer('spreadsheet_id').references(() => spreadsheets.id),
  columnKey: varchar('column_key', { length: 3 }).notNull(), // A, B, C, etc.
  title: text('title'), // Optional column title
  width: integer('width').default(80), // Column width in pixels
  hidden: boolean('hidden').default(false),
  metadata: jsonb('metadata').default({}), // Any additional column metadata
});

// Rows table
export const rows = pgTable('rows', {
  id: serial('id').primaryKey(),
  spreadsheetId: integer('spreadsheet_id').references(() => spreadsheets.id),
  rowIndex: integer('row_index').notNull(), // 1, 2, 3, etc.
  title: text('title'), // Optional row title
  height: integer('height').default(20), // Row height in pixels
  hidden: boolean('hidden').default(false),
  metadata: jsonb('metadata').default({}), // Any additional row metadata
});

// Cells table
export const cells = pgTable('cells', {
  id: serial('id').primaryKey(),
  spreadsheetId: integer('spreadsheet_id').references(() => spreadsheets.id),
  sheetId: integer('sheet_id').references(() => sheets.id),
  columnId: integer('column_id').references(() => columns.id),
  rowId: integer('row_id').references(() => rows.id),
  value: text('value'),
  formula: text('formula'),
  style: jsonb('style').default({}), // Cell styling
  metadata: jsonb('metadata').default({}), // Any additional cell metadata
});

// Merged cells table
export const mergedCells = pgTable('merged_cells', {
  id: serial('id').primaryKey(),
  spreadsheetId: integer('spreadsheet_id').references(() => spreadsheets.id),
  startColumnId: integer('start_column_id').references(() => columns.id),
  startRowId: integer('start_row_id').references(() => rows.id),
  endColumnId: integer('end_column_id').references(() => columns.id),
  endRowId: integer('end_row_id').references(() => rows.id),
  value: text('value'),
  formula: text('formula'),
  style: jsonb('style').default({}),
  metadata: jsonb('metadata').default({}),
});

// Types for the schema
export type Style = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  border?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
};

export type CellMetadata = {
  comment?: string;
  validation?: {
    type: 'list' | 'number' | 'date' | 'text';
    params: any;
  };
  locked?: boolean;
};

export type RowColumnMetadata = {
  frozen?: boolean;
  group?: {
    id: string;
    collapsed: boolean;
  };
}; 