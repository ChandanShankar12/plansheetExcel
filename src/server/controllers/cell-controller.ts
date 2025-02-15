import { Cell } from '../models/cell';


export class CellController {
  static createCell(): Cell {
    return new Cell();
  }

  static updateCellValue(cell: Cell, value: string | number | null): void {
    if (typeof value === 'string' && value.startsWith('=')) {
      cell.setFormula(value);
    } else {
      cell.setValue(value);
    }
  }

  static updateCellStyle(cell: Cell, style: Partial<Cell['style']>): void {
    cell.style = { ...cell.style, ...style };
  }

  // static evaluateCell(cell: Cell, sheet: Sheet): string {
  //   return cell.evaluate(sheet);
  // }

  static cloneCell(cell: Cell): Cell {
    return cell.clone();
  }

  static clearCell(cell: Cell): void {
    cell.clear();
  }

  static clearCellFormatting(cell: Cell): void {
    cell.clearFormatting();
  }
} 