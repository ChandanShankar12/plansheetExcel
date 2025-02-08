// src/server/models/Spreadsheet.ts
import { Sheet } from "./sheet";

export class Spreadsheet {
  sheets: Sheet[] = [];
  activeSheetId: number;

  constructor() {
    const initialSheet = new Sheet('Sheet 1');
    this.sheets.push(initialSheet);
    this.activeSheetId = initialSheet.id;
  }

  addSheet(name: string): Sheet {
    const newSheet = new Sheet(name);
    this.sheets.push(newSheet);
    return newSheet;
  }

  getSheet(name: string): Sheet | undefined {
    return this.sheets.find(sheet => sheet.name === name);
  }

  getSheetById(id: number): Sheet | undefined {
    return this.sheets.find(sheet => sheet.id === id);
  }

  removeSheet(name: string): void {
    this.sheets = this.sheets.filter(sheet => sheet.name !== name);
  }

  getAllSheets(): Sheet[] {
    return this.sheets;
  }

  setActiveSheet(sheetId: number): void {
    this.activeSheetId = sheetId;
  }

  getActiveSheet(): Sheet | undefined {
    return this.getSheetById(this.activeSheetId);
  }

  toJSON() {
    return {
      sheets: this.sheets.map(sheet => sheet.toJSON()),
      activeSheetId: this.activeSheetId
    };
  }

  static fromJSON(data: any): Spreadsheet {
    const spreadsheet = new Spreadsheet();
    spreadsheet.sheets = data.sheets.map((sheetData: any) => Sheet.fromJSON(sheetData));
    spreadsheet.activeSheetId = data.activeSheetId;
    return spreadsheet;
  }
}
