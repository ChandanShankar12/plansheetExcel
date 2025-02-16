import { Spreadsheet } from '../models/spreadsheet';
import { Sheet } from '../models/sheet';
import { SheetController } from './sheet-controller';

export class SpreadsheetController {
  static createSpreadsheet(): Spreadsheet {
    return new Spreadsheet();
  }

  static addSheet(spreadsheet: Spreadsheet, name: string): Sheet {
    const sheet = new Sheet(name);
    spreadsheet.sheets.push(sheet);
    spreadsheet.setActiveSheet(sheet.id);
    return sheet;
  }

  static getSheet(spreadsheet: Spreadsheet, name: string): Sheet | undefined {
    return spreadsheet.getSheet(name);
  }

  static getSheetById(spreadsheet: Spreadsheet, id: number): Sheet | undefined {
    return spreadsheet.getSheetById(id);
  }

  static removeSheet(spreadsheet: Spreadsheet, name: string): void {
    spreadsheet.removeSheet(name);
  }

  static getAllSheets(spreadsheet: Spreadsheet): Sheet[] {
    return spreadsheet.getAllSheets();
  }

  static setActiveSheet(spreadsheet: Spreadsheet, sheetId: number): void {
    spreadsheet.setActiveSheet(sheetId);
  }

  static getActiveSheet(spreadsheet: Spreadsheet): Sheet | undefined {
    return spreadsheet.getActiveSheet();
  }

  static fromJSON(data: any): Spreadsheet {
    return Spreadsheet.fromJSON(data);
  }

  static toJSON(spreadsheet: Spreadsheet): any {
    return spreadsheet.toJSON();
  }
  
} 