import { Workbook } from './workbook';
import { CacheService } from '../services/cache.service';

export class Application {
  private static _instance: Application | null = null;
  private readonly _workbook: Workbook;
  private readonly cacheService: CacheService;

  private constructor() {
    console.log('[Application] Constructor called');
    this.cacheService = CacheService.instance;
    this._workbook = new Workbook();
  }

  public static async initialize(): Promise<Application> {
    if (!Application._instance) {
      console.log('[Application] Initializing new instance');
      Application._instance = new Application();
      
      // Try to load cached state
      try {
        const cachedState = await Application._instance.loadCachedState();
        if (cachedState) {
          console.log('[Application] Loaded cached state');
          Application._instance._workbook.fromJSON(cachedState.workbook);
        }
      } catch (error) {
        console.error('[Application] Failed to load cached state:', error);
      }
    }
    return Application._instance;
  }

  public static get instance(): Application {
    if (!Application._instance) {
      console.log('[Application] Creating new instance without cache');
      Application._instance = new Application();
    }
    return Application._instance;
  }

  public getWorkbook(): Workbook {
    return this._workbook;
  }

  private async loadCachedState(): Promise<any | null> {
    try {
      return await this.cacheService.getApplicationState();
    } catch (error) {
      console.error('[Application] Cache load error:', error);
      return null;
    }
  }

  public async saveState(): Promise<void> {
    try {
      const state = this.toJSON();
      await this.cacheService.cacheApplicationState(state);
      console.log('[Application] State saved to cache');
    } catch (error) {
      console.error('[Application] Failed to save state:', error);
    }
  }

  public toJSON() {
    return {
      workbook: this._workbook.toJSON()
    };
  }

  public static fromJSON(data: any): Application {
    if (!Application._instance) {
      Application._instance = new Application();
    }
    if (data?.workbook) {
      Application._instance._workbook.fromJSON(data.workbook);
    }
    return Application._instance;
  }
}
