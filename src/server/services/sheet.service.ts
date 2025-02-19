import { Sheet } from '../models/sheet';
import { Cell } from '../models/cell';
import { CellStyle } from '@/lib/types';
import { CellService } from './cell.service';

export class SheetService {
  private static instance: SheetService;
  private sheets: Map<number, Sheet> = new Map();
  private cellService: CellService | null = null; // Initialize as null

  private constructor() {
    // Don't initialize cellService here
  }

  static getInstance(): SheetService {
    if (!SheetService.instance) {
      SheetService.instance = new SheetService();
    }
    return SheetService.instance;
  }

  // Lazy initialize cellService when needed
  private getCellService(): CellService {
    if (!this.cellService) {
      this.cellService = CellService.getInstance();
    }
    return this.cellService;
  }

  createSheet(name: string, spreadsheetId: string): Sheet {
    const sheet = new Sheet(name, spreadsheetId);
    this.sheets.set(sheet.id, sheet);
    return sheet;
  }

  getSheet(id: number): Sheet | undefined {
    return this.sheets.get(id);
  }

  getSheetByName(spreadsheetId: string, name: string): Sheet | undefined {
    return Array.from(this.sheets.values()).find(
      sheet => sheet.getSpreadsheetId() === spreadsheetId && sheet.name === name
    );
  }

  updateSheetName(id: number, newName: string): boolean {
    const sheet = this.getSheet(id);
    if (!sheet) return false;

    try {
      // Check for duplicate names in the same spreadsheet
      const existingSheet = this.getSheetByName(sheet.getSpreadsheetId(), newName);
      if (existingSheet && existingSheet.id !== id) {
        throw new Error('Sheet name already exists');
      }

      sheet.name = newName;
      return true;
    } catch (error) {
      console.error('Error updating sheet name:', error);
      return false;
    }
  }

  getCell(sheetId: number, cellId: string): Cell | undefined {
    const sheet = this.getSheet(sheetId);
    if (!sheet) return undefined;

    try {
      const cellService = this.getCellService();
      return cellService.getCellByReference(sheetId, cellId);
    } catch (error) {
      console.error('Error getting cell:', error);
      return undefined;
    }
  }

  updateCell(sheetId: number, cellId: string, value: any, formula?: string): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet) return false;

    try {
      const cellService = this.getCellService();
      return cellService.updateCell(cellId, value, formula);
    } catch (error) {
      console.error('Error updating cell:', error);
      return false;
    }
  }

  getCellsInRange(sheetId: number, startCell: string, endCell: string): Cell[] {
    const sheet = this.getSheet(sheetId);
    if (!sheet) return [];

    try {
      const [startCol, startRow] = this.parseCellReference(startCell);
      const [endCol, endRow] = this.parseCellReference(endCell);

      const cells: Cell[] = [];
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellId = `${this.columnToLetter(col)}${row}`;
          const cell = this.getCell(sheetId, cellId);
          if (cell) cells.push(cell);
        }
      }

      return cells;
    } catch (error) {
      console.error('Error getting cells in range:', error);
      return [];
    }
  }

  private parseCellReference(cellRef: string): [number, number] {
    const match = cellRef.match(/([A-Z]+)(\d+)/);
    if (!match) throw new Error('Invalid cell reference');

    const col = this.letterToColumn(match[1]);
    const row = parseInt(match[2]);
    return [col, row];
  }

  private letterToColumn(letters: string): number {
    let column = 0;
    for (let i = 0; i < letters.length; i++) {
      column *= 26;
      column += letters.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
    }
    return column;
  }

  private columnToLetter(column: number): string {
    let letters = '';
    while (column > 0) {
      const remainder = (column - 1) % 26;
      letters = String.fromCharCode('A'.charCodeAt(0) + remainder) + letters;
      column = Math.floor((column - 1) / 26);
    }
    return letters;
  }

  saveSheet(sheet: Sheet): void {
    this.sheets.set(sheet.id, sheet);
  }

  deleteSheet(id: number): boolean {
    return this.sheets.delete(id);
  }

  cloneSheet(id: number, newName: string): Sheet | undefined {
    const sheet = this.getSheet(id);
    if (!sheet) return undefined;

    try {
      const clonedSheet = this.createSheet(newName, sheet.getSpreadsheetId());
      
      // Clone all cells
      Array.from(sheet.getAllCells().entries()).forEach(([cellId, cell]) => {
        const clonedCell = this.getCellService().createCell(
          clonedSheet.id,
          cell.row,
          cell.column
        );
        clonedCell.setValue(cell.getValue());
        clonedCell.setFormula(cell.getFormula());
        Object.assign(clonedCell.style, cell.style);
      });

      return clonedSheet;
    } catch (error) {
      console.error('Error cloning sheet:', error);
      return undefined;
    }
  }
} 