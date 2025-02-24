import { CacheService } from '../services/cache.service';
import { Application } from '../models/application';
import { CellData } from '@/lib/types';

export class CellController {
  private static _instance: CellController;
  private readonly cacheService: CacheService;
  private readonly application: Application;

  private constructor() {
    this.cacheService = CacheService.instance;
    this.application = Application.instance;
  }

  public static get instance(): CellController {
    if (!CellController._instance) {
      CellController._instance = new CellController();
    }
    return CellController._instance;
  }

  async getValue(sheetId: number, cellId: string): Promise<CellData | null> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    return sheet.getCell(cellId);
  }

  async setValue(sheetId: number, cellId: string, value: any): Promise<void> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) throw new Error('Sheet not found');

    sheet.setCell(cellId, {
      value,
      isModified: true,
      lastModified: new Date().toISOString()
    });

    // Cache the updated sheet
    await this.cacheService.cacheSheet(
      workbook.getName(),
      sheetId,
      sheet.toJSON()
    );
  }

  async updateCell(sheetId: number, cellId: string, data: Partial<CellData>): Promise<void> {
    try {
      const workbook = this.application.getWorkbook();
      const sheet = workbook.getSheet(sheetId);
      if (!sheet) throw new Error('Sheet not found');

      // Get existing cell data and merge with updates
      const existingData = sheet.getCell(cellId);
      const updatedData: CellData = {
        ...existingData,
        ...data,
        isModified: true,
        lastModified: new Date().toISOString()
      };

      // Update the cell
      sheet.setCell(cellId, updatedData);

      // Cache the individual cell
      await this.cacheService.updateCell(
        workbook.getName(),
        sheetId,
        cellId,
        updatedData
      );

      // Also update the sheet cache
      await this.cacheService.cacheSheet(
        workbook.getName(),
        sheetId,
        sheet.toJSON()
      );
    } catch (error) {
      console.error('[CellController] Update cell error:', error);
      throw error;
    }
  }

  async clearCell(sheetId: number, cellId: string): Promise<void> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    sheet.clearCell(cellId);
    
    // Cache the updated sheet
    await this.cacheService.cacheSheet(
      workbook.getName(),
      sheetId,
      sheet.toJSON()
    );
  }
} 