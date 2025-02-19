import { SpreadsheetService } from '../services/spreadsheet.service';
import { Spreadsheet } from '../models/spreadsheet';
import { Sheet } from '../models/sheet';

export class SpreadsheetController {
  private static service = SpreadsheetService.getInstance();

  static createSpreadsheet(workbookId: string): Spreadsheet {
    return this.service.createSpreadsheet(workbookId);
  }

  static getSpreadsheet(workbookId: string): Spreadsheet | undefined {
    return this.service.getSpreadsheet(workbookId);
  }

  static addSheet(workbookId: string, name: string): Sheet | undefined {
    return this.service.addSheet(workbookId, name);
  }

  static removeSheet(workbookId: string, sheetId: number): boolean {
    return this.service.removeSheet(workbookId, sheetId);
  }

  static setActiveSheet(workbookId: string, sheetId: number): boolean {
    return this.service.setActiveSheet(workbookId, sheetId);
  }

  static renameSheet(workbookId: string, sheetId: number, newName: string): boolean {
    return this.service.renameSheet(workbookId, sheetId, newName);
  }

  static duplicateSheet(workbookId: string, sheetId: number): Sheet | undefined {
    return this.service.duplicateSheet(workbookId, sheetId);
  }
} 