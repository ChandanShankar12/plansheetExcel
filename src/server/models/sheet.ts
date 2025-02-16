// src/server/models/Sheet.ts
import { Cell } from "./cell";

export class Sheet {
  id: number;
  name: string;
  cells: Map<string, Cell>;

  constructor(name: string) {
    this.name = name;
    this.id = Date.now();
    this.cells = new Map();
  }

  getCell(cellId: string): Cell {
    if (!this.cells.has(cellId)) {
      const newCell = new Cell();
      const [col, row] = cellId.match(/([A-Z]+)(\d+)/)?.slice(1) || [];
      newCell.row = parseInt(row);
      newCell.column = col;
      newCell.sheet = this;
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
    const clonedSheet = new Sheet(this.name);
    clonedSheet.id = this.id;
    this.cells.forEach((cell, key) => {
      clonedSheet.cells.set(key, cell.clone());
    });
    return clonedSheet;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      cells: Array.from(this.cells.entries()).map(([key, cell]) => ({
        key,
        cell: cell.toJSON()
      }))
    };
  }

  static fromJSON(data: any): Sheet {
    const sheet = new Sheet(data.name);
    sheet.id = data.id;
    data.cells.forEach(({ key, cell }: any) => {
      sheet.cells.set(key, Cell.fromJSON(cell));
    });
    return sheet;
  }
}
