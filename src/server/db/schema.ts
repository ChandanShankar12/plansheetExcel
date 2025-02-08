import { pgTable, serial, text, integer, jsonb, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";


/**
 * Database Schema Overview:
 * 
 * Application Table:
 * - Stores metadata about the spreadsheet application
 * - Contains version info, app settings, etc.
 * 
 * Spreadsheet Table:
 * - Represents a complete spreadsheet document (like an Excel file)
 * - Contains metadata and links to workbooks
 * 
 * Workbook Table:
 * - Represents a collection of sheets within a spreadsheet
 * - Organizes related sheets together
 * 
 * Sheet Table:
 * - Represents a single sheet/tab inside a workbook
 * - Contains grid of cells and sheet-specific settings
 * 
 * Cell Table:
 * - Stores individual cell data within a sheet
 * - Contains values, formulas, formatting, etc.
 * 

 */


export const application = pgTable("application", {
  id: uuid("id").defaultRandom().primaryKey(),
  workbooks: jsonb("workbooks"), // Map<string, Workbook>
  activeWorkbookId: varchar("active_workbook_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2️⃣ Spreadsheet Table
export const spreadsheets = pgTable("spreadsheets", {
  id: uuid("id").defaultRandom().primaryKey(),
  sheets: jsonb("sheets"), // Sheet[]
  activeSheetId: integer("active_sheet_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3️⃣ Workbook Table 
export const workbooks = pgTable("workbooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  spreadsheet: jsonb("spreadsheet"), // Spreadsheet
  config: jsonb("config"), // UserConfig interface
  userId: varchar("user_id", { length: 255 }).notNull(),
  theme: varchar("theme", { length: 10 }).notNull(), // 'light' | 'dark'
  language: varchar("language", { length: 10 }).notNull(),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  autoSave: boolean("auto_save").notNull(),
  lastModified: timestamp("last_modified").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4️⃣ Sheet Table
export const sheets = pgTable("sheets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cells: jsonb("cells"), // Map<string, Cell>
  createdAt: timestamp("created_at").defaultNow(),
});

// 5️⃣ Cell Table
export const cells = pgTable("cells", {
  id: uuid("id").defaultRandom().primaryKey(),
  value: text("value"),  // Make value nullable
  formula: text("formula").default(''),
  row: integer("row").notNull(),
  column: varchar("column", { length: 10 }).notNull(),
  style: jsonb("style").default({}), 
  createdAt: timestamp("created_at").defaultNow(),
});

