// src/server/models/Sheet.ts
import { Cell } from "./cell";

export class Sheet {
  private cells: Map<string, Cell> = new Map();
  private nonEmptyCellIds: Set<string> = new Set();

  constructor(
    public readonly id: number,
    public name: string,
    private workbookId: string
  ) {}

  // Improved cell management
  getCell(cellId: string): Cell {
    if (!this.cells.has(cellId)) {
      const [col, row] = this.parseCellId(cellId);
      const cell = new Cell(this.id, parseInt(row), col);
      this.cells.set(cellId, cell);
    }
    return this.cells.get(cellId)!;
  }

  private parseCellId(cellId: string): [string, string] {
    const match = cellId.match(/([A-Z]+)(\d+)/);
    if (!match) throw new Error('Invalid cell ID');
    return [match[1], match[2]];
  }

  getCellValue(cellId: string): any {
    return this.getCell(cellId).getValue();
  }

  setCellValue(cellId: string, value: any): void {
    const cell = this.getCell(cellId);
    cell.setValue(value);
    if (value) {
      this.nonEmptyCellIds.add(cellId);
    } else {
      this.nonEmptyCellIds.delete(cellId);
    }
  }

  setCellFormula(cellId: string, formula: string): void {
    const cell = this.getCell(cellId);
    cell.setFormula(formula);
  }

  // Sheet management methods
  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getWorkbookId(): string {
    return this.workbookId;
  }

  // Cell collection methods
  getAllCells(): Map<string, Cell> {
    return this.cells;
  }

  getCellsData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.cells.forEach((cell, cellId) => {
      const value = cell.getValue();
      if (value !== undefined && value !== '') {
        data[cellId] = {
          value: cell.getValue(),
          formula: cell.getFormula(),
          style: cell.style
        };
      }
    });
    return data;
  }

  getNonEmptyCellIds(): string[] {
    return Array.from(this.nonEmptyCellIds);
  }

  // Utility methods
  clone(): Sheet {
    const clonedSheet = new Sheet(this.id, this.name, this.workbookId);
    this.cells.forEach((cell, key) => {
      clonedSheet.cells.set(key, cell.clone());
    });
    return clonedSheet;
  }

  clearCells(): void {
    this.cells.clear();
    this.nonEmptyCellIds.clear();
  }

  // Serialization methods
  toJSON() {
    const nonEmptyCells = Array.from(this.cells.entries())
      .filter(([cellId]) => this.nonEmptyCellIds.has(cellId))
      .map(([key, cell]) => ({
        key,
        cell: cell.toJSON()
      }));

    return {
      id: this.id,
      name: this.name,
      workbookId: this.workbookId,
      cells: nonEmptyCells
    };
  }

  static fromJSON(data: any): Sheet {
    const sheet = new Sheet(data.id, data.name, data.workbookId);
    data.cells.forEach(({ key, cell }: any) => {
      sheet.cells.set(key, Cell.fromJSON(cell));
    });
    return sheet;
  }
}
