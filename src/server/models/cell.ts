// src/server/models/Cell.ts
import { CellStyle, CellData } from '@/lib/types';

export class Cell {
  private _value: any;
  private _formula: string;
  private _isModified: boolean;
  public style: CellStyle;

  constructor(
    private readonly sheetId: number,
    private readonly row: number,
    private readonly column: string
  ) {
    this._value = '';
    this._formula = '';
    this._isModified = false;
    this.style = {};
  }

  getValue(): any {
    return this._value;
  }

  setValue(value: any): void {
    this._value = value;
    this._isModified = true;
  }

  getFormula(): string {
    return this._formula;
  }

  setFormula(formula: string): void {
    this._formula = formula;
    this._isModified = true;
  }

  isModifiedCell(): boolean {
    return this._isModified;
  }

  clearModified(): void {
    this._isModified = false;
  }

  toCellData(): CellData {
    return {
      value: this._value,
      formula: this._formula,
      style: this.style,
      isModified: this._isModified,
      lastModified: new Date().toISOString()
    };
  }

  static createEmpty(): CellData {
    return {
      value: '',
      formula: '',
      style: {},
      isModified: false,
      lastModified: new Date().toISOString()
    };
  }

  clone(): Cell {
    const clonedCell = new Cell(this.sheetId, this.row, this.column);
    clonedCell._value = this._value;
    clonedCell._formula = this._formula;
    clonedCell.style = { ...this.style };
    clonedCell._isModified = this._isModified;
    return clonedCell;
  }

  static fromJSON(data: any): Cell {
    const cell = new Cell(data.sheetId, data.row, data.column);
    cell._value = data.value;
    cell._formula = data.formula;
    cell.style = data.style || {};
    cell._isModified = data.isModified || false;
    return cell;
  }
}
