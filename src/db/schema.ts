import { pgTable, serial, text, integer, jsonb, uuid, varchar } from "drizzle-orm/pg-core";

// Table Schema
export const workbook = pgTable("workbook", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull(),
  sheetId: integer("sheet_id").notNull(),
  rowIndex: integer("row_index").notNull(),
  columnIndex: integer("column_index").notNull(),
  value: varchar("value").$type<string | number | null>(),
  metadata: jsonb("metadata").$type<{
    style?: CellStyle;
    formula?: string;
  }>().default({}),
  mergedWith: text("merged_with").$type<string | null>(),
});

// Types for type safety
export type Workbook = typeof workbook.$inferInsert;
export type CellData = typeof workbook.$inferInsert;
// export type NewWorkbook = typeof workbook.$inferInsert;

export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  borders?: {
    top?: string;
    right?: string; 
    bottom?: string;
    left?: string;
  };
};

export type CellMetadata = {
  style?: CellStyle;
  formula?: string;
  comment?: string;
  validation?: {
    type: 'list' | 'number' | 'date' | 'text';
    params: unknown;
  };
  locked?: boolean;
  mergeGroup?: string;
};

// Add this interface
export interface CellUpdate {
  value: any;
  metadata?: {
    style?: Record<string, any>;
    formula?: string;
  };
}
