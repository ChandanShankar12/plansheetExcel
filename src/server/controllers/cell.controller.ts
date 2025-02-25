import { CellData } from '@/lib/types';
import { CacheService } from '../services/cache.service';
import { WorkbookController } from './workbook.controller';

export class CellController {
  private static _instance: CellController | null = null;
  private readonly workbookController: WorkbookController;
  private readonly cacheService: CacheService;

  private constructor() {
    console.log('[CellController] Constructor called');
    this.workbookController = WorkbookController.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): CellController {
    if (!CellController._instance) {
      console.log('[CellController] Creating new instance');
      CellController._instance = new CellController();
    }
    return CellController._instance;
  }

  async getCell(sheetId: number, cellId: string): Promise<CellData | null> {
    console.log('[CellController] Getting cell:', { sheetId, cellId });
    try {
      // Try to get from cache first
      try {
        const cachedCell = await this.cacheService.getCell(
          this.workbookController.getName(),
          sheetId,
          cellId
        );
        
        if (cachedCell) {
          console.log('[CellController] Cell found in cache');
          return cachedCell;
        }
      } catch (error) {
        console.warn('[CellController] Failed to get cell from cache:', error);
      }

      // Get from sheet if not in cache
      const sheet = this.workbookController.getSheet(sheetId);
      if (!sheet) {
        console.error('[CellController] Sheet not found:', sheetId);
        return null;
      }

      const cell = sheet.getCell(cellId);
      if (!cell) {
        console.log('[CellController] Cell not found in sheet');
        return null;
      }

      // Cache the cell for future use
      try {
        await this.cacheService.cacheCell(
          this.workbookController.getName(),
          sheetId,
          cellId,
          cell
        );
      } catch (error) {
        console.warn('[CellController] Failed to cache cell:', error);
      }

      return cell;
    } catch (error) {
      console.error('[CellController] Failed to get cell:', error);
      throw error;
    }
  }

  async updateCell(sheetId: number, cellId: string, updates: Partial<CellData>): Promise<void> {
    console.log('[CellController] Updating cell:', { sheetId, cellId, updates });
    try {
      const sheet = this.workbookController.getSheet(sheetId);
      if (!sheet) {
        throw new Error('Sheet not found');
      }

      // Update cell in sheet
      sheet.updateCell(cellId, updates);

      // Cache the updated cell
      const updatedCell = sheet.getCell(cellId);
      if (updatedCell) {
        await this.cacheService.cacheCell(
          this.workbookController.getName(),
          sheetId,
          cellId,
          updatedCell
        );
      }

      // Sync workbook state
      await this.workbookController.syncState();
    } catch (error) {
      console.error('[CellController] Failed to update cell:', error);
      throw error;
    }
  }

  async deleteCell(sheetId: number, cellId: string): Promise<void> {
    console.log('[CellController] Deleting cell:', { sheetId, cellId });
    try {
      const sheet = this.workbookController.getSheet(sheetId);
      if (!sheet) {
        throw new Error('Sheet not found');
      }

      // Delete cell from sheet
      sheet.deleteCell(cellId);

      // Delete from cache
      await this.cacheService.clearCell(
        this.workbookController.getName(),
        sheetId,
        cellId
      );

      // Sync workbook state
      await this.workbookController.syncState();
    } catch (error) {
      console.error('[CellController] Failed to delete cell:', error);
      throw error;
    }
  }
} 