import { redis } from '../db/cache/redis_client';
import { CellData } from '@/lib/types';

export class CacheService {
  private static _instance: CacheService;

  private constructor() {
    console.log('[CacheService] Constructor called');
  }

  public static getInstance(): CacheService {
    if (!CacheService._instance) {
      console.log('[CacheService] Creating new instance');
      CacheService._instance = new CacheService();
    }
    return CacheService._instance;
  }

  public async initialize(): Promise<void> {
    console.log('[CacheService] Initializing...');
    // Check if Redis is available
    try {
      if (redis) {
        // Test connection with a ping
        await redis.ping();
        console.log('[CacheService] Redis connection verified');
      } else {
        console.warn('[CacheService] Redis client not available');
      }
    } catch (error) {
      console.error('[CacheService] Redis connection failed:', error);
    }
  }

  // Generic cache operations
  async get<T>(key: string): Promise<T | null> {
    console.log(`[CacheService] Getting key: ${key}`);
    try {
      if (!redis) {
        console.warn('[CacheService] Redis client not available');
        return null;
      }
      
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[CacheService] Failed to get data:', error);
      return null;
    }
  }

  async set(key: string, value: any, expirySeconds: number = 3600): Promise<void> {
    console.log(`[CacheService] Setting key: ${key}`);
    try {
      if (!redis) {
        console.warn('[CacheService] Redis client not available');
        return;
      }
      
      await redis.set(key, JSON.stringify(value), { EX: expirySeconds });
    } catch (error) {
      console.error('[CacheService] Failed to set data:', error);
    }
  }

  async delete(key: string): Promise<void> {
    console.log(`[CacheService] Deleting key: ${key}`);
    try {
      if (!redis) {
        console.warn('[CacheService] Redis client not available');
        return;
      }
      
      await redis.del(key);
    } catch (error) {
      console.error('[CacheService] Failed to delete data:', error);
    }
  }

  // Workbook operations
  async cacheWorkbook(workbookName: string, data: any): Promise<void> {
    await this.set(`workbook:${workbookName}`, data);
  }

  async getWorkbook(workbookName: string): Promise<any> {
    return await this.get(`workbook:${workbookName}`);
  }

  // Sheet operations
  async cacheSheet(workbookName: string, sheetId: number, data: any): Promise<void> {
    await this.set(`workbook:${workbookName}:sheet:${sheetId}`, data);
  }

  async getSheet(workbookName: string, sheetId: number): Promise<any> {
    return await this.get(`workbook:${workbookName}:sheet:${sheetId}`);
  }

  async deleteSheet(workbookName: string, sheetId: number): Promise<void> {
    await this.delete(`workbook:${workbookName}:sheet:${sheetId}`);
  }

  // Cell operations
  async cacheCell(workbookName: string, sheetId: number, cellId: string, cell: CellData): Promise<void> {
    await this.set(`workbook:${workbookName}:sheet:${sheetId}:cell:${cellId}`, cell);
  }

  async getCell(workbookName: string, sheetId: number, cellId: string): Promise<CellData | null> {
    return await this.get(`workbook:${workbookName}:sheet:${sheetId}:cell:${cellId}`);
  }

  async clearCell(workbookName: string, sheetId: number, cellId: string): Promise<void> {
    await this.delete(`workbook:${workbookName}:sheet:${sheetId}:cell:${cellId}`);
  }

  // Clear cache operations
  async clearWorkbookCache(workbookName: string): Promise<void> {
    try {
      if (!redis) {
        console.warn('[CacheService] Redis client not available');
        return;
      }
      
      const pattern = `workbook:${workbookName}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('[CacheService] Failed to clear workbook cache:', error);
    }
  }

  // Application state methods
  async cacheApplicationState(data: any): Promise<void> {
    await this.set('application:state', data);
  }

  async getApplicationState(): Promise<any | null> {
    return await this.get('application:state');
  }
}

export default CacheService; 