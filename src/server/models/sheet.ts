// src/server/models/Sheet.ts
import { Cell } from "./cell";

export class Sheet {
  id: number;
  name: string;
  private cells: Map<string, Cell>;
  private spreadsheetId: string; // Reference to parent spreadsheet

  constructor(name: string, spreadsheetId: string) {
    this.id = Date.now();
    this.name = name;
    this.spreadsheetId = spreadsheetId;
    this.cells = new Map();
  }

  getCell(cellId: string): Cell {
    if (!this.cells.has(cellId)) {
      const [col, row] = cellId.match(/([A-Z]+)(\d+)/)?.slice(1) || [];
      const newCell = new Cell(this.id, parseInt(row), col);
      this.cells.set(cellId, newCell);
    }
    return this.cells.get(cellId)!;
  }

  setCell(cellId: string, value: string | number | null): void {
    const cell = this.getCell(cellId);
    cell.setValue(value);
  }

  getAllCells(): Map<string, Cell> {
    return this.cells;
  }

  clone(): Sheet {
    const clonedSheet = new Sheet(this.name, this.spreadsheetId);
    clonedSheet.id = this.id;
    this.cells.forEach((cell, key) => {
      clonedSheet.cells.set(key, cell.clone());
    });
    return clonedSheet;
  }

  getSpreadsheetId(): string {
    return this.spreadsheetId;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      spreadsheetId: this.spreadsheetId,
      cells: Array.from(this.cells.entries()).map(([key, cell]) => ({
        key,
        cell: cell.toJSON()
      }))
    };
  }

  static fromJSON(data: any): Sheet {
    const sheet = new Sheet(data.name, data.spreadsheetId);
    sheet.id = data.id;
    data.cells.forEach(({ key, cell }: any) => {
      sheet.cells.set(key, Cell.fromJSON(cell));
    });
    return sheet;
  }
}
