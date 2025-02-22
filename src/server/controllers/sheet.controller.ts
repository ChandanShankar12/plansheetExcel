import { CacheService } from '../services/cache.service';
import { Application } from '../models/application';
import { Sheet } from '../models/sheet';
import { SheetData } from '@/lib/types';
import { CellData } from '@/lib/types';

export class SheetController {
  private static _instance: SheetController;
  private readonly cacheService: CacheService;
  private readonly application: Application;

  private constructor() {
    this.cacheService = CacheService.instance;
    this.application = Application.instance;
  }

  public static get instance(): SheetController {
    if (!SheetController._instance) {
      SheetController._instance = new SheetController();
    }
    return SheetController._instance;
  }

  async createSheet(name: string): Promise<Sheet> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.addSheet(name);
    console.log('Creating sheet in controller:', sheet.getId(), sheet.getName());
    
    // Cache the new sheet
    await this.cacheService.cacheSheet(
      workbook.getId(),
      sheet.getId(),
      sheet.toJSON()
    );
    
    return sheet;
  }

  async getSheet(id: number): Promise<Sheet> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(id);
    if (!sheet) {
      console.error('Sheet not found:', id);
      throw new Error('Sheet not found');
    }

    // Try to get cached data
    const cachedData = await this.cacheService.getSheet(workbook.getId(), id);
    if (cachedData) {
      Object.entries(cachedData.cells || {}).forEach(([cellId, cellData]) => {
        sheet.setCell(cellId, cellData as CellData);
      });
    }

    return sheet;
  }

  async getAllSheets(): Promise<Sheet[]> {
    const workbook = this.application.getWorkbook();
    const sheets = workbook.getSheets();
    if (sheets.length === 0) {
      // If no sheets exist, create and cache initial sheet
      const sheet = workbook.ensureInitialSheet();
      await this.cacheService.cacheSheet(
        workbook.getId(),
        sheet.getId(),
        sheet.toJSON()
      );
      return [sheet];
    }
    return sheets;
  }

  async deleteSheet(name: string): Promise<void> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheetByName(name);
    if (!sheet) throw new Error('Sheet not found');
    
    workbook.removeSheet(sheet.getId());
    await this.cacheService.deleteSheet(workbook.getId(), sheet.getId());
  }

  async updateSheet(name: string, updates: Partial<SheetData>): Promise<Sheet> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheetByName(name);
    if (!sheet) throw new Error('Sheet not found');

    if (updates.name) {
      sheet.setName(updates.name);
    }
    
    if (updates.cells) {
      Object.entries(updates.cells).forEach(([id, data]) => {
        sheet.setCell(id, data);
      });
    }

    await this.cacheService.cacheSheet(
      workbook.getId(),
      sheet.getId(),
      sheet.toJSON()
    );
    
    return sheet;
  }
} 