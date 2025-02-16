import { Sheet } from '../models/sheet';
import { Cell } from '../models/cell';

export class SheetController {
  static createSheet(name: string): Sheet {
    const sheet = new Sheet(name);
    
    // Initialize all cells in the sheet
    for (let row = 1; row <= 100; row++) {
      for (let col = 'A'.charCodeAt(0); col <= 'Z'.charCodeAt(0); col++) {
        const cellId = `${String.fromCharCode(col)}${row}`;
        sheet.setCell(cellId, new Cell(cellId));
      }
    }
    
    return sheet;
  }

  static getCell(sheet: Sheet, cellId: string): Cell {
    return sheet.getCell(cellId);
  }

  static setCell(sheet: Sheet, cellId: string, value: string | number | null): void {
    const cell = sheet.getCell(cellId);
    if (typeof value === 'string' && value.startsWith('=')) {
      cell.setFormula(value);
    } else {
      cell.setValue(value);
    }
  }

  static getAllCells(sheet: Sheet): Map<string, Cell> {
    return sheet.getAllCells();
  }

  static fromJSON(data: any): Sheet {
    return Sheet.fromJSON(data);
  }

  static toJSON(sheet: Sheet): any {
    return sheet.toJSON();
  }

  // Additional utility methods
  static getCellsInRange(
    sheet: Sheet,
    startCell: string,
    endCell: string
  ): Cell[] {
    const cells: Cell[] = [];
    const [startCol, startRow] = startCell.match(/([A-Z]+)(\d+)/)?.slice(1) || [];
    const [endCol, endRow] = endCell.match(/([A-Z]+)(\d+)/)?.slice(1) || [];

    const minCol = Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0));
    const maxCol = Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0));
    const minRow = Math.min(parseInt(startRow), parseInt(endRow));
    const maxRow = Math.max(parseInt(startRow), parseInt(endRow));

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cellId = `${String.fromCharCode(col)}${row}`;
        cells.push(sheet.getCell(cellId));
      }
    }

    return cells;
  }

  static clearColumn(sheet: Sheet, col: string): void {
    const cells = Array.from(sheet.cells.entries())
      .filter(([cellId]) => cellId.startsWith(col))
      .map(([_, cell]) => cell);
    
    cells.forEach(cell => cell.clear());
  }

  static clearRow(sheet: Sheet, row: number): void {
    const cells = Array.from(sheet.cells.entries())
      .filter(([cellId]) => cellId.endsWith(row.toString()))
      .map(([_, cell]) => cell);
    
    cells.forEach(cell => cell.clear());
  }

  static shiftColumnsLeft(sheet: Sheet, fromCol: string): void {
    const colIndex = fromCol.charCodeAt(0);
    for (let col = colIndex; col < 90; col++) { // 90 is 'Z'
      const currentCol = String.fromCharCode(col);
      const nextCol = String.fromCharCode(col + 1);
      
      Array.from(sheet.cells.entries())
        .filter(([cellId]) => cellId.startsWith(nextCol))
        .forEach(([cellId, cell]) => {
          const newCellId = cellId.replace(nextCol, currentCol);
          sheet.cells.set(newCellId, cell);
          sheet.cells.delete(cellId);
        });
    }
  }

  static shiftRowsUp(sheet: Sheet, fromRow: number): void {
    const maxRow = Math.max(...Array.from(sheet.cells.keys())
      .map(cellId => parseInt(cellId.match(/\d+/)?.[0] || '0')));
    
    for (let row = fromRow; row < maxRow; row++) {
      Array.from(sheet.cells.entries())
        .filter(([cellId]) => cellId.endsWith((row + 1).toString()))
        .forEach(([cellId, cell]) => {
          const newCellId = cellId.replace((row + 1).toString(), row.toString());
          sheet.cells.set(newCellId, cell);
          sheet.cells.delete(cellId);
        });
    }
  }
} 