import { CacheService } from '../services/cache.service';
import { Application } from '../models/application';
import { Sheet } from '../models/sheet';
import { SheetData } from '@/lib/types';
import { CellData } from '@/lib/types';

export class SheetController {
  private static _instance: SheetController | null = null;
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
    
    await this.cacheService.cacheSheet(
      workbook.getName(),
      sheet.getId(),
      sheet.toJSON()
    );
    
    return sheet;
  }

  async getSheet(id: number): Promise<Sheet> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(id);
    if (!sheet) throw new Error('Sheet not found');
    return sheet;
  }

  async getAllSheets(): Promise<Sheet[]> {
    const workbook = this.application.getWorkbook();
    return workbook.getSheets();
  }

  async deleteSheet(name: string): Promise<void> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheetByName(name);
    if (!sheet) throw new Error('Sheet not found');
    
    workbook.removeSheet(sheet.getId());
    await this.cacheService.deleteSheet(workbook.getName(), sheet.getId());
  }

  async updateSheet(id: number, updates: Partial<SheetData>): Promise<Sheet> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(id);
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
      workbook.getName(),
      sheet.getId(),
      sheet.toJSON()
    );
    
    return sheet;
  }
} 