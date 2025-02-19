import { Workbook } from '../models/workbook';
import { Spreadsheet } from '../models/spreadsheet';
import { UserConfig } from '../models/workbook';
import { SpreadsheetService } from './spreadsheet.service';

export class WorkbookService {
  private static instance: WorkbookService;
  private workbooks: Map<string, Workbook> = new Map();
  private spreadsheetService: SpreadsheetService;

  private constructor() {
    this.spreadsheetService = SpreadsheetService.getInstance();
  }

  static getInstance(): WorkbookService {
    if (!WorkbookService.instance) {
      WorkbookService.instance = new WorkbookService();
    }
    return WorkbookService.instance;
  }

  createWorkbook(): Workbook {
    const workbook = new Workbook();
    this.workbooks.set(workbook.id, workbook);
    
    // Create associated spreadsheet
    const spreadsheet = this.spreadsheetService.createSpreadsheet(workbook.id);
    
    return workbook;
  }

  getWorkbook(id: string): Workbook | undefined {
    return this.workbooks.get(id);
  }

  updateConfig(workbookId: string, config: Partial<UserConfig>): boolean {
    const workbook = this.getWorkbook(workbookId);
    if (!workbook) return false;

    try {
      workbook.updateConfig(config);
      return true;
    } catch (error) {
      console.error('Error updating workbook config:', error);
      return false;
    }
  }

  getSpreadsheet(workbookId: string): Spreadsheet | undefined {
    const workbook = this.getWorkbook(workbookId);
    if (!workbook) return undefined;

    return this.spreadsheetService.getSpreadsheet(workbookId);
  }

  setTheme(workbookId: string, theme: 'light' | 'dark'): boolean {
    const workbook = this.getWorkbook(workbookId);
    if (!workbook) return false;

    try {
      workbook.setTheme(theme);
      return true;
    } catch (error) {
      console.error('Error setting theme:', error);
      return false;
    }
  }

  setAutoSave(workbookId: string, enabled: boolean): boolean {
    const workbook = this.getWorkbook(workbookId);
    if (!workbook) return false;

    try {
      workbook.setAutoSave(enabled);
      return true;
    } catch (error) {
      console.error('Error setting auto-save:', error);
      return false;
    }
  }

  duplicateWorkbook(workbookId: string): Workbook | undefined {
    const originalWorkbook = this.getWorkbook(workbookId);
    if (!originalWorkbook) return undefined;

    try {
      // Create new workbook
      const newWorkbook = this.createWorkbook();

      // Copy config
      newWorkbook.updateConfig({
        ...originalWorkbook.getConfig(),
        lastModified: new Date(),
        createdAt: new Date()
      });

      // Copy spreadsheet
      const originalSpreadsheet = this.spreadsheetService.getSpreadsheet(workbookId);
      if (originalSpreadsheet) {
        const sheets = originalSpreadsheet.getAllSheets();
        const newSpreadsheet = this.spreadsheetService.getSpreadsheet(newWorkbook.id);

        if (newSpreadsheet) {
          // Remove default sheet from new spreadsheet
          const defaultSheet = newSpreadsheet.getActiveSheet();
          if (defaultSheet) {
            this.spreadsheetService.removeSheet(newWorkbook.id, defaultSheet.id);
          }

          // Clone all sheets from original
          sheets.forEach(sheet => {
            this.spreadsheetService.duplicateSheet(newWorkbook.id, sheet.id);
          });
        }
      }

      return newWorkbook;
    } catch (error) {
      console.error('Error duplicating workbook:', error);
      return undefined;
    }
  }

  deleteWorkbook(id: string): boolean {
    const workbook = this.getWorkbook(id);
    if (!workbook) return false;

    try {
      // Delete associated spreadsheet first
      this.spreadsheetService.deleteSpreadsheet(id);
      return this.workbooks.delete(id);
    } catch (error) {
      console.error('Error deleting workbook:', error);
      return false;
    }
  }

  saveWorkbook(workbook: Workbook): void {
    this.workbooks.set(workbook.id, workbook);
  }

  getLastModified(workbookId: string): Date | undefined {
    const workbook = this.getWorkbook(workbookId);
    return workbook?.getLastModified();
  }

  isAutoSaveEnabled(workbookId: string): boolean | undefined {
    const workbook = this.getWorkbook(workbookId);
    return workbook?.isAutoSaveEnabled();
  }
} 