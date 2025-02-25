import { CacheService } from '../services/cache.service';
import { Application } from '../models/application';
import { Sheet } from '../models/sheet';
import { SheetData } from '@/lib/types';

export class SheetController {
  private static _instance: SheetController | null = null;
  private readonly cacheService: CacheService;
  private readonly application: Application;

  private constructor() {
    console.log('[SheetController] Constructor called');
    this.cacheService = CacheService.getInstance();
    this.application = Application.getInstance();
  }

  public static getInstance(): SheetController {
    if (!SheetController._instance) {
      console.log('[SheetController] Creating new instance');
      SheetController._instance = new SheetController();
    }
    return SheetController._instance;
  }

  async createSheet(name: string): Promise<Sheet> {
    console.log('[SheetController] Creating sheet:', name);
    try {
      const workbook = this.application.getWorkbook();
      if (!workbook) {
        throw new Error('Workbook not initialized');
      }
      
      const sheet = await workbook.addSheet(name);
      
      try {
        await this.cacheService.cacheSheet(
          workbook.getName(),
          sheet.getId(),
          sheet.toJSON()
        );
      } catch (error) {
        console.error('[SheetController] Failed to cache sheet:', error);
      }
      
      return sheet;
    } catch (error) {
      console.error('[SheetController] Failed to create sheet:', error);
      throw error;
    }
  }

  async getSheet(id: number): Promise<Sheet | null> {
    console.log('[SheetController] Getting sheet:', id);
    try {
      // Try to get from cache first
      try {
        const cachedSheet = await this.cacheService.getSheet(
          this.application.getWorkbook().getName(),
          id
        );
        
        if (cachedSheet) {
          console.log('[SheetController] Sheet found in cache');
          return Sheet.fromJSON(cachedSheet);
        }
      } catch (error) {
        console.warn('[SheetController] Failed to get sheet from cache:', error);
      }

      // Get from workbook if not in cache
      const workbook = this.application.getWorkbook();
      const sheet = workbook.getSheet(id);
      
      if (!sheet) {
        console.warn('[SheetController] Sheet not found:', id);
        return null;
      }
      
      // Cache the sheet
      try {
        await this.cacheService.cacheSheet(
          workbook.getName(),
          id,
          sheet.toJSON()
        );
      } catch (error) {
        console.warn('[SheetController] Failed to cache sheet:', error);
      }
      
      return sheet;
    } catch (error) {
      console.error('[SheetController] Failed to get sheet:', error);
      return null;
    }
  }

  async getAllSheets(): Promise<Sheet[]> {
    console.log('[SheetController] Getting all sheets');
    const workbook = this.application.getWorkbook();
    return workbook.getSheets();
  }

  async deleteSheet(id: number): Promise<void> {
    console.log('[SheetController] Deleting sheet:', id);
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(id);
    
    if (!sheet) {
      console.warn('[SheetController] Sheet not found for deletion:', id);
      throw new Error('Sheet not found');
    }
    
    const sheetId = sheet.getId();
    workbook.removeSheet(sheetId);
    
    try {
      await this.cacheService.deleteSheet(workbook.getName(), sheetId);
    } catch (error) {
      console.error('[SheetController] Failed to delete sheet from cache:', error);
    }
  }

  async updateSheet(id: number, updates: Partial<SheetData>): Promise<Sheet | null> {
    console.log('[SheetController] Updating sheet:', id, updates);
    const workbook = this.application.getWorkbook();
    const sheet = workbook.getSheet(id);
    
    if (!sheet) {
      console.warn('[SheetController] Sheet not found for update:', id);
      return null;
    }

    if (updates.name) {
      sheet.setName(updates.name);
    }
    
    if (updates.cells) {
      Object.entries(updates.cells).forEach(([id, data]) => {
        sheet.setCell(id, data);
      });
    }

    try {
      await this.cacheService.cacheSheet(
        workbook.getName(),
        sheet.getId(),
        sheet.toJSON()
      );
    } catch (error) {
      console.error('[SheetController] Failed to cache updated sheet:', error);
    }
    
    return sheet;
  }
} 