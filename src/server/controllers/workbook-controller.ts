import { Workbook } from '../models/workbook';
import { Spreadsheet } from '../models/spreadsheet';

export class WorkbookController {
  static createWorkbook(): Workbook {
    return new Workbook();
  }

  static getSpreadsheet(workbook: Workbook): Spreadsheet {
    return workbook.getSpreadsheet();
  }

  static getConfig(workbook: Workbook): any {
    return workbook.getConfig();
  }

  static updateConfig(workbook: Workbook, updates: any): void {
    workbook.updateConfig(updates);
  }

  // static getUserId(workbook: Workbook): string {
  //   return workbook.getUserId();
  // }

  static getTheme(workbook: Workbook): 'light' | 'dark' {
    return workbook.getTheme();
  }

  static setTheme(workbook: Workbook, theme: 'light' | 'dark'): void {
    workbook.setTheme(theme);
  }

  static isAutoSaveEnabled(workbook: Workbook): boolean {
    return workbook.isAutoSaveEnabled();
  }

  static setAutoSave(workbook: Workbook, enabled: boolean): void {
    workbook.setAutoSave(enabled);
  }

  static getLastModified(workbook: Workbook): Date {
    return workbook.getLastModified();
  }

  static getCreatedAt(workbook: Workbook): Date {
    return workbook.getCreatedAt();
  }

  static fromJSON(data: any): Workbook {
    return Workbook.fromJSON(data);
  }

  static toJSON(workbook: Workbook): any {
    return workbook.toJSON();
  }
} 