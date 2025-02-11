// src/server/models/Cell.ts
import { Sheet } from "./sheet";

export class Cell {
  id: string;
  private value: string | number | null = null;
  private formula: string = "";
  sheet: Sheet;
  row: number;
  column: string;
  style: {
    fontFamily?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textColor?: string;
    backgroundColor?: string;
    stroke?: string;
    align?: 'left' | 'center' | 'right';
  };

  constructor() {
    this.id = crypto.randomUUID();
    this.value = "";
    this.formula = "";
    this.style = {};
  }

  getValue(): string | number | null {
    if (this.formula) {
      return this.evaluate(this.sheet);
    }
    return this.value;
  }

  setValue(value: string | number | null): void {
    // Clear formula if setting a direct value
    this.formula = "";
    this.value = value;
  }

  getFormula(): string {
    return this.formula;
  }

  setFormula(formula: string): void {
    this.formula = formula;
    // When setting a formula, evaluate it immediately
    this.value = this.evaluate(this.sheet);
  }

  evaluate(sheet: Sheet): string | number | null {
    if (this.formula) {
      try {
        if (this.formula.startsWith('=')) {
          // Basic formula evaluation - remove the '=' prefix
          const formulaContent = this.formula.substring(1);
          
          // For now, just return the formula content
          // TODO: Implement proper formula evaluation
          return formulaContent;
        }
        return this.formula;
      } catch (error) {
        console.error('Formula evaluation error:', error);
        return this.formula; // Return the raw formula if evaluation fails
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
    this.value = "";
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
