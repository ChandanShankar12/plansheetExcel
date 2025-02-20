import { CellService } from '../services/cell.service';
import { CellStyle } from '../models/cell';

export class CellController {
  private static instance: CellController | null = null;
  private cellService: CellService;

  private constructor() {
    this.cellService = CellService.getInstance();
  }

  static getInstance(): CellController {
    if (!CellController.instance) {
      CellController.instance = new CellController();
    }
    return CellController.instance;
  }

  async getValue(sheetId: number, cellId: string) {
    try {
      return this.cellService.getValue(sheetId, cellId);
    } catch (error) {
      throw new Error('Failed to get cell value');
    }
  }

  async setValue(sheetId: number, cellId: string, value: any) {
    try {
      return this.cellService.setValue(sheetId, cellId, value);
    } catch (error) {
      throw new Error('Failed to set cell value');
    }
  }

  async setFormula(sheetId: number, cellId: string, formula: string) {
    try {
      return this.cellService.setFormula(sheetId, cellId, formula);
    } catch (error) {
      throw new Error('Failed to set formula');
    }
  }

  async setStyle(sheetId: number, cellId: string, style: Partial<CellStyle>) {
    try {
      return this.cellService.setStyle(sheetId, cellId, style);
    } catch (error) {
      throw new Error('Failed to set cell style');
    }
  }
} 