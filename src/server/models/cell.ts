// src/server/models/Cell.ts
import { Sheet } from "./sheet";

export class Cell {
  id: string;
  private value: any = null;
  private formula: string = "";
  sheet?: Sheet;
  row?: number;
  column?: string;
  style: CellStyle = {};
  private isDirty: boolean = false; // Track if cell has been modified

  constructor() {
    this.id = crypto.randomUUID();
  }

  getValue(): any {
    return this.formula ? this.evaluate() : this.value;
  }

  setValue(value: any): void {
    if (this.value !== value) {
      this.value = value;
      this.formula = "";
      this.isDirty = true; // Mark as modified
    }
  }

  isDirtyCell(): boolean {
    return this.isDirty;
  }

  clearDirtyFlag(): void {
    this.isDirty = false;
  }

  getFormula(): string {
    return this.formula;
  }

  setFormula(formula: string): void {
    this.formula = formula;
    this.value = this.evaluate();
  }

  private evaluate(): string | null {
    if (this.formula) {
      try {
        if (this.formula.startsWith('=')) {
          return this.formula.substring(1);
        }
        return this.formula;
      } catch (error) {
        console.error('Formula evaluation error:', error);
        return this.formula;
      }
    }
    return this.value;
  }

  // Style methods
  setFontFamily(font: string): void {
    this.style.fontFamily = font;
  }

  setFontSize(size: number): void {
    this.style.fontSize = size;
  }

  setBold(bold: boolean): void {
    this.style.bold = bold;
  }

  setItalic(italic: boolean): void {
    this.style.italic = italic;
  }

  setUnderline(underline: boolean): void {
    this.style.underline = underline;
  }

  setTextColor(color: string): void {
    this.style.textColor = color;
  }

  setBackgroundColor(color: string): void {
    this.style.backgroundColor = color;
  }

  setStroke(stroke: string): void {
    this.style.stroke = stroke;
  }

  setAlignment(align: 'left' | 'center' | 'right'): void {
    this.style.align = align;
  }

  // Get cell reference (e.g. "A1", "B2")
  getCellReference(): string {
    return `${this.column}${this.row}`;
  }

  // Clear cell contents
  clear(): void {
    this.value = null;
    this.formula = "";
  }

  // Clear cell formatting
  clearFormatting(): void {
    this.style = {};
  }

  // Clone cell
  clone(): Cell {
    const clonedCell = new Cell();
    clonedCell.setValue(this.value);
    clonedCell.setFormula(this.formula);
    clonedCell.row = this.row;
    clonedCell.column = this.column;
    clonedCell.style = {...this.style};
    return clonedCell;
  }

  toJSON() {
    return {
      id: this.id,
      value: this.value,
      formula: this.formula,
      row: this.row,
      column: this.column,
      style: this.style
    };
  }

  static fromJSON(data: any): Cell {
    const cell = new Cell();
    cell.id = data.id;
    cell.setValue(data.value);
    cell.setFormula(data.formula);
    cell.row = data.row;
    cell.column = data.column;
    cell.style = data.style;
    return cell;
  }
}
