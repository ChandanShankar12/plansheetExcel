import { Workbook, UserConfig } from '../models/workbook';
import { CacheService } from './cache.service';

export class WorkbookService {
  private static instance: WorkbookService | null = null;
  private cacheService: CacheService;
  private workbook: Workbook;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.workbook = Workbook.getInstance();
  }

  static getInstance(): WorkbookService {
    if (!WorkbookService.instance) {
      WorkbookService.instance = new WorkbookService();
    }
    return WorkbookService.instance;
  }

  getWorkbook(): Workbook {
    return this.workbook;
  }

  async updateConfig(config: Partial<UserConfig>): Promise<void> {
    this.workbook.updateConfig(config);
    await this.cacheService.setWorkbook(
      this.workbook.getId(),
      this.workbook.toJSON()
    );
  }

  async addSheet(name: string) {
    const sheet = this.workbook.addSheet(name);
    await this.cacheService.setSheet(
      this.workbook.getId(),
      sheet.getId(),
      sheet.toJSON()
    );
    return sheet;
  }

  async updateSheetName(sheetId: number, name: string) {
    const sheet = this.workbook.getSheet(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    sheet.setName(name);
    await this.cacheService.setSheet(
      this.workbook.getId(),
      sheetId,
      sheet.toJSON()
    );
    return sheet;
  }

  saveWorkbook(): string {
    const workbook = this.getWorkbook();
    return JSON.stringify(workbook.toJSON());
  }

  loadWorkbook(data: string): void {
    const parsedData = JSON.parse(data);
    Workbook.fromJSON(parsedData);
  }
} 