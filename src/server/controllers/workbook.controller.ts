import { Workbook, UserConfig } from '../models/workbook';
import { CacheService } from '../services/cache.service';
import { Application } from '../models/application';

export class WorkbookController {
  private static _instance: WorkbookController;
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

  getWorkbook(): Workbook {
    return this.application.getWorkbook();
  }

  async addSheet(name: string) {
    try {
      const workbook = this.application.getWorkbook();
      const sheet = workbook.addSheet(name);
      
      // Cache the new sheet
      await this.cacheService.cacheSheet(
        workbook.getId(),
        sheet.getId(),
        sheet.toJSON()
      );
      
      return sheet;
    } catch (error) {
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
        workbook.getId(),
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
        workbook.getId(),
        0,
        workbook.toJSON()
      );
    } catch (error) {
      throw new Error('Failed to update config');
    }
  }

  async saveWorkbook(): Promise<void> {
    try {
      const workbook = this.application.getWorkbook();
      await this.cacheService.cacheSheet(
        workbook.getId(),
        0,
        workbook.toJSON()
      );
    } catch (error) {
      throw new Error('Failed to save workbook');
    }
  }
} 