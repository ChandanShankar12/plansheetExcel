import { Style, CellMetadata, RowColumnMetadata } from '../schema';

interface SpreadsheetData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ColumnData {
  id: number;
  spreadsheetId: number;
  key: string;
  title?: string;
  width: number;
  hidden: boolean;
  metadata: RowColumnMetadata;
}

interface RowData {
  id: number;
  spreadsheetId: number;
  index: number;
  title?: string;
  height: number;
  hidden: boolean;
  metadata: RowColumnMetadata;
}

interface CellData {
  id: number;
  spreadsheetId: number;
  columnId: number;
  rowId: number;
  value: string;
  formula?: string;
  style: Style;
  metadata: CellMetadata;
}

interface SheetData {
  id: number;
  spreadsheetId: number;
  name: string;
  index: number;
  createdAt: string;
  updatedAt: string;
}

export class SpreadsheetStorage {
  private saveToFile(type: string, data: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`spreadsheet_${type}`, JSON.stringify(data));
    }
  }

  private loadFromFile(type: string) {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`spreadsheet_${type}`);
      return data ? JSON.parse(data) : {};
    }
    return {};
  }

  private spreadsheets: Record<number, SpreadsheetData> = this.loadFromFile('spreadsheets');
  private columns: Record<string, ColumnData> = this.loadFromFile('columns');
  private rows: Record<string, RowData> = this.loadFromFile('rows');
  private cells: Record<string, CellData> = this.loadFromFile('cells');
  private sheets: Record<number, SheetData> = this.loadFromFile('sheets');

  createSpreadsheet(name: string): number {
    const id = Date.now();
    this.spreadsheets[id] = {
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveToFile('spreadsheets', this.spreadsheets);
    return id;
  }

  createSheet(spreadsheetId: number, name: string, index: number): number {
    const id = Date.now();
    this.sheets[id] = {
      id,
      spreadsheetId,
      name,
      index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveToFile('sheets', this.sheets);
    return id;
  }

  updateCell(spreadsheetId: number, sheetId: number, cellId: string, data: {
    value: string;
    formula?: string;
    style?: Partial<Style>;
    metadata?: Partial<CellMetadata>;
  }) {
    const { col, row } = this.getCellCoords(cellId);
    
    // Create or get column
    const columnKey = `${spreadsheetId}_${col}`;
    if (!this.columns[columnKey]) {
      this.columns[columnKey] = {
        id: Date.now(),
        spreadsheetId,
        key: col,
        width: 80,
        hidden: false,
        metadata: {}
      };
      this.saveToFile('columns', this.columns);
    }

    // Create or get row
    const rowKey = `${spreadsheetId}_${row}`;
    if (!this.rows[rowKey]) {
      this.rows[rowKey] = {
        id: Date.now(),
        spreadsheetId,
        index: row,
        height: 20,
        hidden: false,
        metadata: {}
      };
      this.saveToFile('rows', this.rows);
    }

    // Update cell
    const cellKey = `${spreadsheetId}_${sheetId}_${cellId}`;
    this.cells[cellKey] = {
      id: Date.now(),
      spreadsheetId,
      columnId: this.columns[columnKey].id,
      rowId: this.rows[rowKey].id,
      value: data.value,
      formula: data.formula,
      style: data.style || {},
      metadata: data.metadata || {}
    };

    // Save all changes
    this.saveToFile('cells', this.cells);
    this.updateSpreadsheetTimestamp(spreadsheetId);
  }

  private updateSpreadsheetTimestamp(id: number) {
    if (this.spreadsheets[id]) {
      this.spreadsheets[id].updatedAt = new Date().toISOString();
      this.saveToFile('spreadsheets', this.spreadsheets);
    }
  }

  getSpreadsheet(id: number): SpreadsheetData | null {
    return this.spreadsheets[id] || null;
  }

  getCell(spreadsheetId: number, cellId: string) {
    const key = `${spreadsheetId}_${cellId}`;
    return this.cells[key] || null;
  }

  private getCellCoords(cellId: string) {
    const col = cellId.match(/[A-Z]+/)?.[0] || '';
    const row = parseInt(cellId.match(/\d+/)?.[0] || '0');
    return { col, row };
  }

  getAllData() {
    return {
      spreadsheets: this.spreadsheets,
      sheets: this.sheets,
      columns: this.columns,
      rows: this.rows,
      cells: this.cells
    };
  }
}

export const storage = new SpreadsheetStorage(); 