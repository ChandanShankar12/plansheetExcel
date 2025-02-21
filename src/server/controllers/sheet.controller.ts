import { SheetService } from '../services/sheet.service';
import { CacheService } from '../services/cache.service';
import { Workbook } from '@/server/models/workbook';

export class SheetController {
  private static instance: SheetController | null = null;
  private sheetService: SheetService;
  private cacheService: CacheService;

  private constructor() {
    this.sheetService = SheetService.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  static getInstance(): SheetController {
    if (!SheetController.instance) {
      SheetController.instance = new SheetController();
    }
    return SheetController.instance;
  }

  async getSheet(sheetId: number) {
    try {
      return this.sheetService.getSheet(sheetId);
    } catch (error) {
      throw new Error('Failed to get sheet');
    }
  }

  async getAllCells(sheetId: number) {
    try {
      return this.sheetService.getAllCells(sheetId);
    } catch (error) {
      throw new Error('Failed to get cells');
    }
  }

  async getCellValue(sheetId: number, cellId: string) {
    try {
      return this.sheetService.getCellValue(sheetId, cellId);
    } catch (error) {
      throw new Error('Failed to get cell value');
    }
  }

  async setCellValue(sheetId: number, cellId: string, value: any) {
    try {
      return this.sheetService.setCellValue(sheetId, cellId, value);
    } catch (error) {
      throw new Error('Failed to set cell value');
    }
  }

  async getModifiedCells(sheetId: number) {
    try {
      return this.sheetService.getModifiedCells(sheetId);
    } catch (error) {
      throw new Error('Failed to get modified cells');
    }
  }

  async clearModifiedCells(sheetId: number) {
    try {
      return this.sheetService.clearModifiedCells(sheetId);
    } catch (error) {
      throw new Error('Failed to clear modified cells');
    }
  }

  async setName(sheetId: number, name: string) {
    try {
      const result = await this.sheetService.setName(sheetId, name);
      
      // Update cache
      const workbook = Workbook.getInstance();
      const sheet = workbook.getSheet(sheetId);
      if (sheet) {
        await this.cacheService.setWithExpiry(
          this.cacheService.generateSheetKey(workbook.getId(), sheetId),
          sheet.toJSON()
        );
      }
      
      return result;
    } catch (error) {
      throw new Error('Failed to set sheet name');
    }
  }

  async addSheet(name: string) {
    try {
      const workbook = Workbook.getInstance();
      
      // Create new sheet
      const newSheet = workbook.addSheet(name);
      
      // Save to cache
      await this.cacheService.setSheet(
        workbook.getId(),
        newSheet.id,
        newSheet.toJSON()
      );

      return newSheet;
    } catch (error) {
      console.error('Failed to add sheet:', error);
      throw error;
    }
  }
} 