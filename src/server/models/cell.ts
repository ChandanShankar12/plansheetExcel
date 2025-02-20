// src/server/models/Cell.ts
import { Sheet } from "./sheets";
import { CellStyle } from "@/lib/types";

export class Cell {
  private value: any;
  private formula: string;
  public style: CellStyle = {};
  private isModified: boolean = false;

  constructor(
    public readonly sheetId: number,
    public readonly row: number,
    public readonly column: string
  ) {
    this.value = '';
    this.formula = '';
  }

  getValue(): any {
    return this.value;
  }

  setValue(value: any): void {
    this.value = value;
    this.isModified = true;
  }

  getFormula(): string {
    return this.formula;
  }

  setFormula(formula: string): void {
    this.formula = formula;
    this.isModified = true;
  }

  isModifiedCell(): boolean {
    return this.isModified;
  }

  clearModified(): void {
    this.isModified = false;
  }

  toJSON() {
    return {
      value: this.value,
      formula: this.formula,
      style: this.style,
      row: this.row,
      column: this.column
    };
  }

  clone(): Cell {
    const clonedCell = new Cell(this.sheetId, this.row, this.column);
    clonedCell.value = this.value;
    clonedCell.formula = this.formula;
    clonedCell.style = { ...this.style };
    return clonedCell;
  }

  static fromJSON(data: any): Cell {
    const cell = new Cell(data.sheetId, data.row, data.column);
    cell.value = data.value;
    cell.formula = data.formula;
    cell.style = data.style || {};
    return cell;
  }
}
