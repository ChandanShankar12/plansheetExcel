import { Application } from '../models/application';
import { Cell, CellStyle } from '../models/cell';

export class CellService {
  private static instance: CellService | null = null;
  private application: Application;

  private constructor() {
    this.application = Application.getInstance();
  }

  static getInstance(): CellService {
    if (!CellService.instance) {
      CellService.instance = new CellService();
    }
    return CellService.instance;
  }

  private getCell(sheetId: number, cellId: string): Cell {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    return sheet.getCell(cellId);
  }

  getValue(sheetId: number, cellId: string): any {
    const cell = this.getCell(sheetId, cellId);
    return cell.getValue();
  }

  setValue(sheetId: number, cellId: string, value: any): void {
    const cell = this.getCell(sheetId, cellId);
    cell.setValue(value);
  }

  setFormula(sheetId: number, cellId: string, formula: string): void {
    const cell = this.getCell(sheetId, cellId);
    cell.setFormula(formula);
  }

  setStyle(sheetId: number, cellId: string, style: Partial<CellStyle>): void {
    const cell = this.getCell(sheetId, cellId);
    cell.style = { ...cell.style, ...style };
  }

  getFormula(sheetId: number, cellId: string): string {
    const cell = this.getCell(sheetId, cellId);
    return cell.getFormula();
  }
} 