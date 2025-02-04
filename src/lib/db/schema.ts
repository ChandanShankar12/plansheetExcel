import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";


// Table Schema
export const workbook = pgTable("workbook", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  sheetId: text("sheet_id").notNull(),
  rowIndex: integer("row_index").notNull(),
  columnIndex: integer("column_index").notNull(),
  value: text("value"),
  metadata: jsonb("metadata").$type<{
    style?: Record<string, any>;
    formula?: string;
  }>().default({}),
  mergedWith: text("merged_with"), // If part of a merged group, stores the ID of the primary (anchor) cell
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Types for type safety
export type Workbook = typeof workbook.$inferSelect;
export type NewWorkbook = typeof workbook.$inferInsert;

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
  value: string;
  metadata?: {
    style?: Record<string, any>;
    formula?: string;
  };
}

// Update the Sheet type
export interface Sheet {
  id: number;
  userId: string;
  sheetId: string;
  rowIndex: number;
  columnIndex: number;
  value: string;
  metadata: {
    style?: Record<string, any>;
    formula?: string;
  };
  mergedWith: string;
  createdAt: Date;
  updatedAt: Date;
}