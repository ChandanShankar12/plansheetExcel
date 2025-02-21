import { CellService } from '../services/cell.service';
import { CellStyle } from '../models/cell';
import { CacheService } from '../services/cache.service';
import { Workbook } from '../models/workbook';

export class CellController {
  private static instance: CellController | null = null;
  private cellService: CellService;
  private cacheService: CacheService;

  private constructor() {
    this.cellService = CellService.getInstance();
    this.cacheService = CacheService.getInstance();
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
      // Update cell in service
      await this.cellService.setValue(sheetId, cellId, value);

      // Get workbook and sheet for caching
      const workbook = Workbook.getInstance();
      const sheet = workbook.getSheet(sheetId);
      
      if (!sheet) throw new Error('Sheet not found');

      // Cache updates at all levels using public methods
      await Promise.all([
        this.cacheService.setCell(
          workbook.getId(),
          sheetId,
          cellId,
          sheet.getCell(cellId).toJSON()
        ),
        this.cacheService.setSheet(
          workbook.getId(),
          sheetId,
          sheet.toJSON()
        ),
        this.cacheService.setWorkbook(
          workbook.getId(),
          workbook.toJSON()
        )
      ]);

      return true;
    } catch (error) {
      console.error('Failed to set cell value:', error);
      throw error;
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