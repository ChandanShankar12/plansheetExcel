// src/server/models/Cell.ts
import { CellStyle } from '@/lib/types';

export interface CellData {
  value: any;
  formula: string;
  style: CellStyle;
  isModified: boolean;
  lastModified: string;
  metadata?: Record<string, any>;
}

export class Cell {
  private _value: any;
  private _formula: string;
  private _isModified: boolean;
  public style: CellStyle;
  private _lastModified: string;

  constructor(
    private readonly sheetId: number,
    private readonly row: number,
    private readonly column: string
  ) {
    this._value = '';
    this._formula = '';
    this._isModified = false;
    this._lastModified = new Date().toISOString();
    this.style = {};
  }

  getValue(): any {
    return this._value;
  }

  setValue(value: any): void {
    this._value = value;
    this._isModified = true;
    this._lastModified = new Date().toISOString();
  }

  getFormula(): string {
    return this._formula;
  }

  setFormula(formula: string): void {
    this._formula = formula;
    this._isModified = true;
    this._lastModified = new Date().toISOString();
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
      lastModified: this._lastModified
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
    clonedCell._lastModified = this._lastModified;
    return clonedCell;
  }

  static fromJSON(data: any): Cell {
    const cell = new Cell(data.sheetId, data.row, data.column);
    cell._value = data.value;
    cell._formula = data.formula;
    cell.style = data.style || {};
    cell._isModified = data.isModified || false;
    cell._lastModified = data.lastModified || new Date().toISOString();
    return cell;
  }

  updateProperties(updates: Partial<CellData>): void {
    if (updates.value !== undefined) {
      this._value = updates.value;
    }
    if (updates.formula !== undefined) {
      this._formula = updates.formula;
    }
    if (updates.style !== undefined) {
      this.style = { ...this.style, ...updates.style };
    }
    this._isModified = true;
    this._lastModified = new Date().toISOString();
  }
}
