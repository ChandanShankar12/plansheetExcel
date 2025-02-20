import { Application } from '../models/application';
import { Sheet } from '../models/sheets';
import { Cell } from '../models/cell';

export class SheetService {
  private static instance: SheetService | null = null;
  private application: Application;

  private constructor() {
    this.application = Application.getInstance();
  }

  static getInstance(): SheetService {
    if (!SheetService.instance) {
      SheetService.instance = new SheetService();
    }
    return SheetService.instance;
  }

  getSheet(sheetId: number): Sheet {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    return sheet;
  }

  getAllCells(sheetId: number): Map<string, Cell> {
    const sheet = this.getSheet(sheetId);
    return sheet.getAllCells();
  }

  getCellValue(sheetId: number, cellId: string): any {
    const sheet = this.getSheet(sheetId);
    return sheet.getCellValue(cellId);
  }

  setCellValue(sheetId: number, cellId: string, value: any): void {
    const sheet = this.getSheet(sheetId);
    sheet.setCellValue(cellId, value);
  }

  setCellFormula(sheetId: number, cellId: string, formula: string): void {
    const sheet = this.getSheet(sheetId);
    sheet.setCellFormula(cellId, formula);
  }

  getModifiedCells(sheetId: number): Record<string, any> {
    const sheet = this.getSheet(sheetId);
    return sheet.getModifiedCells();
  }

  clearModifiedCells(sheetId: number): void {
    const sheet = this.getSheet(sheetId);
    sheet.clearModifiedCells();
  }

  setName(sheetId: number, name: string): void {
    const sheet = this.getSheet(sheetId);
    sheet.setName(name);
  }

  clone(sheetId: number): Sheet {
    const sheet = this.getSheet(sheetId);
    return sheet.clone();
  }

  clearCells(sheetId: number): void {
    const sheet = this.getSheet(sheetId);
    sheet.clearCells();
  }
} 