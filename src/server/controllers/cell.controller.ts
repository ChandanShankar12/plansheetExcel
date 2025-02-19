import { CellService } from '../services/cell.service';
import { Cell } from '../models/cell';
import { CellStyle } from '@/lib/types';

export class CellController {
  private static service = CellService.getInstance();

  static createCell(sheetId: number, row: number, column: string): Cell {
    return this.service.createCell(sheetId, row, column);
  }

  static getCell(id: string) {
    return this.service.getCell(id);
  }

  static getCellByReference(sheetId: number, cellRef: string) {
    return this.service.getCellByReference(sheetId, cellRef);
  }

  static updateCell(id: string, value: any, formula?: string): boolean {
    return this.service.updateCell(id, value, formula);
  }

  static updateCellStyle(id: string, style: Partial<CellStyle>): boolean {
    return this.service.updateCellStyle(id, style);
  }

  static evaluateFormula(cell: Cell): any {
    return this.service.evaluateFormula(cell);
  }
} 