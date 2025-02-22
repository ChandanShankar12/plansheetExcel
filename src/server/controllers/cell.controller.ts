import { CacheService } from '../services/cache.service';
import { Application } from '../models/application';
import { CellData } from '@/lib/types';
import { Cell } from '../models/cell';

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

  async getValue(sheetId: number, cellId: string): Promise<CellData> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    return sheet.getCell(cellId);
  }

  async setValue(sheetId: number, cellId: string, data: CellData): Promise<void> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) throw new Error('Sheet not found');

    // Create or update cell
    const [row, col] = this.parseCellId(cellId);
    const cell = new Cell(sheetId, row, col);
    cell.setValue(data.value);
    
    // Update sheet with new cell
    sheet.setCell(cellId, {
      value: data.value,
      isModified: true,
      lastModified: new Date().toISOString()
    });
    
    // Cache the updated sheet
    await this.cacheService.cacheSheet(
      workbook.getId(),
      sheetId,
      sheet.toJSON()
    );
  }

  async clearCell(sheetId: number, cellId: string): Promise<void> {
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) throw new Error('Sheet not found');
    
    sheet.clearCell(cellId);
    
    // Cache the updated sheet
    await this.cacheService.cacheSheet(
      workbook.getId(),
      sheetId,
      sheet.toJSON()
    );
  }

  private parseCellId(cellId: string): [number, string] {
    const col = cellId.match(/[A-Z]+/)?.[0] || '';
    const row = parseInt(cellId.match(/\d+/)?.[0] || '0');
    return [row, col];
  }
} 