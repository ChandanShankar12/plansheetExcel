import { Spreadsheet } from '../models/spreadsheet';
import { Sheet } from '../models/sheet';
import { SheetService } from './sheet.service';

export class SpreadsheetService {
  private static instance: SpreadsheetService;
  private spreadsheets: Map<string, Spreadsheet> = new Map();
  private sheetService: SheetService;

  private constructor() {
    this.sheetService = SheetService.getInstance();
  }

  static getInstance(): SpreadsheetService {
    if (!SpreadsheetService.instance) {
      SpreadsheetService.instance = new SpreadsheetService();
    }
    return SpreadsheetService.instance;
  }

  createSpreadsheet(workbookId: string): Spreadsheet {
    const spreadsheet = new Spreadsheet(workbookId);
    this.spreadsheets.set(workbookId, spreadsheet);
    
    // Create initial sheet
    const initialSheet = this.sheetService.createSheet('Sheet 1', workbookId);
    spreadsheet.addSheet(initialSheet);
    spreadsheet.setActiveSheet(initialSheet.id);
    
    return spreadsheet;
  }

  getSpreadsheet(workbookId: string): Spreadsheet | undefined {
    return this.spreadsheets.get(workbookId);
  }

  addSheet(workbookId: string, name: string): Sheet | undefined {
    const spreadsheet = this.getSpreadsheet(workbookId);
    if (!spreadsheet) return undefined;

    try {
      // Check for duplicate sheet names
      if (spreadsheet.getSheet(name)) {
        throw new Error('Sheet name already exists');
      }

      const newSheet = this.sheetService.createSheet(name, workbookId);
      spreadsheet.addSheet(newSheet);
      return newSheet;
    } catch (error) {
      console.error('Error adding sheet:', error);
      return undefined;
    }
  }

  removeSheet(workbookId: string, sheetId: number): boolean {
    const spreadsheet = this.getSpreadsheet(workbookId);
    if (!spreadsheet) return false;

    try {
      const sheet = spreadsheet.getSheetById(sheetId);
      if (!sheet) return false;

      // Don't allow removing the last sheet
      if (spreadsheet.getAllSheets().length <= 1) {
        throw new Error('Cannot remove the last sheet');
      }

      // If removing active sheet, set another sheet as active
      if (spreadsheet.getActiveSheet()?.id === sheetId) {
        const remainingSheets = spreadsheet.getAllSheets().filter(s => s.id !== sheetId);
        if (remainingSheets.length > 0) {
          spreadsheet.setActiveSheet(remainingSheets[0].id);
        }
      }

      this.sheetService.deleteSheet(sheetId);
      return true;
    } catch (error) {
      console.error('Error removing sheet:', error);
      return false;
    }
  }

  setActiveSheet(workbookId: string, sheetId: number): boolean {
    const spreadsheet = this.getSpreadsheet(workbookId);
    if (!spreadsheet) return false;

    try {
      const sheet = spreadsheet.getSheetById(sheetId);
      if (!sheet) return false;

      spreadsheet.setActiveSheet(sheetId);
      return true;
    } catch (error) {
      console.error('Error setting active sheet:', error);
      return false;
    }
  }

  renameSheet(workbookId: string, sheetId: number, newName: string): boolean {
    const spreadsheet = this.getSpreadsheet(workbookId);
    if (!spreadsheet) return false;

    try {
      // Check for duplicate names
      if (spreadsheet.getSheet(newName)) {
        throw new Error('Sheet name already exists');
      }

      return this.sheetService.updateSheetName(sheetId, newName);
    } catch (error) {
      console.error('Error renaming sheet:', error);
      return false;
    }
  }

  duplicateSheet(workbookId: string, sheetId: number): Sheet | undefined {
    const spreadsheet = this.getSpreadsheet(workbookId);
    if (!spreadsheet) return undefined;

    try {
      const originalSheet = spreadsheet.getSheetById(sheetId);
      if (!originalSheet) return undefined;

      // Generate new name (Sheet 1 -> Sheet 1 (1))
      let newName = `${originalSheet.name} (1)`;
      let counter = 1;
      while (spreadsheet.getSheet(newName)) {
        counter++;
        newName = `${originalSheet.name} (${counter})`;
      }

      const clonedSheet = this.sheetService.cloneSheet(sheetId, newName);
      if (clonedSheet) {
        spreadsheet.addSheet(clonedSheet);
      }
      return clonedSheet;
    } catch (error) {
      console.error('Error duplicating sheet:', error);
      return undefined;
    }
  }

  saveSpreadsheet(workbookId: string, spreadsheet: Spreadsheet): void {
    this.spreadsheets.set(workbookId, spreadsheet);
  }

  deleteSpreadsheet(workbookId: string): boolean {
    const spreadsheet = this.getSpreadsheet(workbookId);
    if (!spreadsheet) return false;

    // Clean up all associated sheets
    spreadsheet.getAllSheets().forEach(sheet => {
      this.sheetService.deleteSheet(sheet.id);
    });

    return this.spreadsheets.delete(workbookId);
  }
} 