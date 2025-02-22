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
  async cacheSheet(workbookId: string, sheetId: number, data: any): Promise<void> {
    const key = `workbook:${workbookId}:sheet:${sheetId}`;
    await redis.set(key, JSON.stringify(data), { EX: 3600 }); // 1 hour expiry
  }

  async getSheet(workbookId: string, sheetId: number): Promise<any | null> {
    const key = `workbook:${workbookId}:sheet:${sheetId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSheet(workbookId: string, sheetId: number): Promise<void> {
    const key = `workbook:${workbookId}:sheet:${sheetId}`;
    await redis.del(key);
  }

  async clearWorkbookCache(workbookId: string): Promise<void> {
    const pattern = `workbook:${workbookId}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}