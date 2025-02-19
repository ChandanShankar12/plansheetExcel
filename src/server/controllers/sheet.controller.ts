import { SheetService } from '../services/sheet.service';
import { Sheet } from '../models/sheet';
import { Cell } from '../models/cell';
import { CellStyle } from '@/lib/types';

export class SheetController {
  private static service = SheetService.getInstance();

  static createSheet(name: string, spreadsheetId: string): Sheet {
    return this.service.createSheet(name, spreadsheetId);
  }

  static getSheet(id: number): Sheet | undefined {
    return this.service.getSheet(id);
  }

  static getSheetByName(spreadsheetId: string, name: string): Sheet | undefined {
    return this.service.getSheetByName(spreadsheetId, name);
  }

  static updateSheetName(id: number, newName: string): boolean {
    return this.service.updateSheetName(id, newName);
  }

  static getCell(sheetId: number, cellId: string): Cell | undefined {
    return this.service.getCell(sheetId, cellId);
  }

  static updateCell(sheetId: number, cellId: string, value: any, formula?: string): boolean {
    return this.service.updateCell(sheetId, cellId, value, formula);
  }

  static getCellsInRange(sheetId: number, startCell: string, endCell: string): Cell[] {
    return this.service.getCellsInRange(sheetId, startCell, endCell);
  }

  static cloneSheet(id: number, newName: string): Sheet | undefined {
    return this.service.cloneSheet(id, newName);
  }
} 