import { WorkbookService } from '../services/workbook.service';
import { Workbook } from '../models/workbook';
import { Spreadsheet } from '../models/spreadsheet';
import { UserConfig } from '../models/workbook';

export class WorkbookController {
  private static service = WorkbookService.getInstance();

  static createWorkbook(): Workbook {
    return this.service.createWorkbook();
  }

  static getWorkbook(id: string): Workbook | undefined {
    return this.service.getWorkbook(id);
  }

  static updateConfig(workbookId: string, config: Partial<UserConfig>): boolean {
    return this.service.updateConfig(workbookId, config);
  }

  static getSpreadsheet(workbookId: string): Spreadsheet | undefined {
    return this.service.getSpreadsheet(workbookId);
  }

  static setTheme(workbookId: string, theme: 'light' | 'dark'): boolean {
    return this.service.setTheme(workbookId, theme);
  }

  static setAutoSave(workbookId: string, enabled: boolean): boolean {
    return this.service.setAutoSave(workbookId, enabled);
  }

  static duplicateWorkbook(workbookId: string): Workbook | undefined {
    return this.service.duplicateWorkbook(workbookId);
  }

  static deleteWorkbook(id: string): boolean {
    return this.service.deleteWorkbook(id);
  }

  static getLastModified(workbookId: string): Date | undefined {
    return this.service.getLastModified(workbookId);
  }

  static isAutoSaveEnabled(workbookId: string): boolean | undefined {
    return this.service.isAutoSaveEnabled(workbookId);
  }
} 