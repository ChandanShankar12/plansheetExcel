import { Workbook } from './workbook';
import { CacheService } from '../services/cache.service';

export class Application {
  private static _instance: Application | null = null;
  private _workbook: Workbook;
  private cacheService: CacheService;
  private _initialized: boolean = false;

  private constructor() {
    console.log('[Application] Constructor called');
    this.cacheService = CacheService.getInstance();
    this._workbook = Workbook.getInstance();
  }

  public static getInstance(): Application {
    if (!Application._instance) {
      console.log('[Application] Creating new instance');
      Application._instance = new Application();
    }
    return Application._instance;
  }

  public static get instance(): Application {
    return Application.getInstance();
  }

  public static async initialize(): Promise<Application> {
    console.log('[Application] Initializing application');
    const app = Application.instance;
    await app.initialize();
    return app;
  }

  public getWorkbook(): Workbook {
    return this._workbook;
  }

  public async initialize(): Promise<void> {
    if (this._initialized) {
      console.log('[Application] Already initialized');
      return;
    }

    console.log('[Application] Starting initialization sequence');
    try {
      // Initialize cache service
      await this.cacheService.initialize();
      
      // Try to load application state from cache
      const cachedState = await this.cacheService.getApplicationState();
      if (cachedState) {
        console.log('[Application] Restoring from cached state');
        await this.fromJSON(cachedState);
      } else {
        console.log('[Application] No cached state found, initializing with defaults');
        // Initialize workbook with default state
        await this._workbook.initialize();
        
        // Cache the initial state
        try {
          await this.cacheService.cacheApplicationState({
            workbook: this._workbook.toJSON()
          });
        } catch (error) {
          console.warn('[Application] Failed to cache initial state:', error);
        }
      }
      
      this._initialized = true;
      console.log('[Application] Initialization complete');
    } catch (error) {
      console.error('[Application] Initialization failed:', error);
      throw error;
    }
  }

  public static async fromJSON(data: any): Promise<Application> {
    console.log('[Application] Creating from JSON');
    const app = Application.instance;
    await app.fromJSON(data);
    return app;
  }

  public async fromJSON(data: any): Promise<void> {
    console.log('[Application] Restoring from JSON');
    try {
      if (data?.workbook) {
        this._workbook.fromJSON(data.workbook);
        console.log('[Application] Workbook state restored');
      }
      this._initialized = true;
    } catch (error) {
      console.error('[Application] Failed to restore from JSON:', error);
      throw error;
    }
  }

  public toJSON() {
    return {
      workbook: this._workbook.toJSON(),
      initialized: this._initialized,
      timestamp: new Date().toISOString()
    };
  }
}
