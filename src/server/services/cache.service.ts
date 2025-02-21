import { redis } from '../db/cache/redis_client';
import { SetOptions } from 'redis';
import { Application } from '@/server/models/application';

export class CacheService {
  private static instance: CacheService | null = null;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  generateWorkbookKey(workbookId: string): string {
    return `workbook:${workbookId}`;
  }

  generateSheetKey(workbookId: string, sheetId: number): string {
    return `workbook:${workbookId}:sheet:${sheetId}`;
  }

  async setWorkbook(workbookId: string, data: any): Promise<void> {
    const key = this.generateWorkbookKey(workbookId);
    await redis.set(key, JSON.stringify(data), {
      EX: 3600 // 1 hour expiry
    });
  }

  async setSheet(workbookId: string, sheetId: number, data: any): Promise<void> {
    const key = this.generateSheetKey(workbookId, sheetId);
    await redis.set(key, JSON.stringify(data), {
      EX: 3600 // 1 hour expiry
    });
  }

  async getWorkbook(workbookId: string): Promise<any | null> {
    const key = this.generateWorkbookKey(workbookId);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getSheet(workbookId: string, sheetId: number): Promise<any | null> {
    const key = this.generateSheetKey(workbookId, sheetId);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSheet(workbookId: string, sheetId: number): Promise<void> {
    const key = this.generateSheetKey(workbookId, sheetId);
    await redis.del(key);
  }

  async clearWorkbookCache(workbookId: string): Promise<void> {
    const pattern = `workbook:${workbookId}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  public async setCell(workbookId: string, sheetId: number, cellId: string, data: any): Promise<void> {
    const app = Application.getInstance();
    const actualWorkbookId = app.getWorkbook().getId();
    
    await this.setWithExpiry(this.generateCellKey(actualWorkbookId, sheetId, cellId), data);
  }

  public generateCellKey(workbookId: string, sheetId: number, cellId: string): string {
    return `wb:${workbookId}:sheet:${sheetId}:cell:${cellId}`;
  }

  public async setWithExpiry(key: string, value: any, expirySeconds: number = 3600): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), {
        EX: expirySeconds
      });
    } catch (error) {
      console.error('Cache SET operation failed:', error);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache GET operation failed:', error);
      return null;
    }
  }

  public generateSheetCellsKey(sheetId: number): string {
    return `sheet:${sheetId}:cells`;
  }

  public async setCells(sheetId: number, cells: Record<string, any>): Promise<void> {
    await this.setWithExpiry(this.generateSheetCellsKey(sheetId), cells);
  }

  public async getCells(sheetId: number): Promise<Record<string, any> | null> {
    return this.get(this.generateSheetCellsKey(sheetId));
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache DELETE operation failed:', error);
      throw error;
    }
  }
} 