import { Workbook, UserConfig } from '../models/workbook';
import { CacheService } from '../services/cache.service';
import { Application } from '../models/application';

export class WorkbookController {
  private static _instance: WorkbookController | null = null;
  private readonly cacheService: CacheService;
  private readonly application: Application;

  private constructor() {
    this.cacheService = CacheService.instance;
    this.application = Application.instance;
  }

  public static get instance(): WorkbookController {
    if (!WorkbookController._instance) {
      WorkbookController._instance = new WorkbookController();
    }
    return WorkbookController._instance;
  }

  public getWorkbook(): Workbook {
    return this.application.getWorkbook();
  }

  async addSheet(name?: string) {
    try {
      console.log('[WorkbookController] Adding new sheet:', name);
      const workbook = this.application.getWorkbook();
      const sheetName = name || `Sheet ${workbook.getSheets().length + 1}`;
      const sheet = workbook.addSheet(sheetName);
      
      console.log('[WorkbookController] Caching new sheet:', sheet.getId());
      await this.cacheService.cacheSheet(
        workbook.getName(),
        sheet.getId(),
        sheet.toJSON()
      );
      
      return sheet;
    } catch (error) {
      console.error('[WorkbookController] Failed to add sheet:', error);
      throw new Error('Failed to add sheet');
    }
  }

  async updateSheetName(sheetName: string, name: string) {
    try {
      const workbook = this.application.getWorkbook();
      const sheet = workbook.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet not found');
      
      sheet.setName(name);
      
      // Cache the updated sheet
      await this.cacheService.cacheSheet(
        workbook.getName(),
        sheet.getId(),
        sheet.toJSON()
      );
      
      return sheet;
    } catch (error) {
      throw new Error('Failed to update sheet name');
    }
  }

  async updateConfig(config: Partial<UserConfig>) {
    try {
      const workbook = this.application.getWorkbook();
      workbook.updateConfig(config);
      
      // Cache the updated workbook config
      await this.cacheService.cacheSheet(
        workbook.getName(),
        0,
        workbook.toJSON()
      );
    } catch (error) {
      throw new Error('Failed to update config');
    }
  }

  public async saveWorkbook(): Promise<void> {
    const workbook = this.getWorkbook();
    await this.cacheService.cacheSheet(
      workbook.getName(),
      0,
      workbook.toJSON()
    );
  }
} 