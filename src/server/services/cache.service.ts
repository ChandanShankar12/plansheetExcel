import { redis } from '../db/cache/redis_client';

export class CacheService {
  private static _instance: CacheService;

  private constructor() {}

  public static get instance(): CacheService {
    if (!CacheService._instance) {
      CacheService._instance = new CacheService();
    }
    return CacheService._instance;
  }

  // Core caching methods
  async cacheSheet(workbookName: string, sheetId: number, data: any): Promise<void> {
    const key = `workbook:${workbookName}:sheet:${sheetId}`;
    await redis.set(key, JSON.stringify(data), { EX: 3600 }); // 1 hour expiry
  }

  async getSheet(workbookName: string, sheetId: number): Promise<any | null> {
    const key = `workbook:${workbookName}:sheet:${sheetId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSheet(workbookName: string, sheetId: number): Promise<void> {
    const key = `workbook:${workbookName}:sheet:${sheetId}`;
    await redis.del(key);
  }

  async clearWorkbookCache(workbookName: string): Promise<void> {
    const pattern = `workbook:${workbookName}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  // Application state methods
  async cacheApplicationState(data: any): Promise<void> {
    await redis.set('application:instance', JSON.stringify(data), { EX: 3600 });
  }

  async getApplicationState(): Promise<any | null> {
    const data = await redis.get('application:instance');
    return data ? JSON.parse(data) : null;
  }

  // Cell-specific methods
  async updateCell(workbookName: string, sheetId: number, cellId: string, data: any): Promise<void> {
    const key = `workbook:${workbookName}:sheet:${sheetId}:cell:${cellId}`;
    await redis.set(key, JSON.stringify(data), { EX: 3600 });
  }

  async getCell(workbookName: string, sheetId: number, cellId: string): Promise<any | null> {
    const key = `workbook:${workbookName}:sheet:${sheetId}:cell:${cellId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }
}