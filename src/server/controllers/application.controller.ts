import { Application } from '../models/application';
import { CacheService } from '../services/cache.service';
import { WorkbookController } from './workbook.controller';

export class ApplicationController {
  private static _instance: ApplicationController | null = null;
  private readonly workbookController: WorkbookController;
  private readonly cacheService: CacheService;

  private constructor() {
    console.log('[ApplicationController] Constructor called');
    this.cacheService = CacheService.getInstance();
    this.workbookController = WorkbookController.getInstance();
  }

  public static getInstance(): ApplicationController {
    if (!ApplicationController._instance) {
      console.log('[ApplicationController] Creating new instance');
      ApplicationController._instance = new ApplicationController();
    }
    return ApplicationController._instance;
  }

  async initialize(): Promise<void> {
    console.log('[ApplicationController] Initializing application');
    
    // Initialize cache service
    await this.cacheService.initialize();
    
    // Initialize workbook controller
    await this.workbookController.initialize();
    
    console.log('[ApplicationController] Initialization complete');
  }

  getWorkbookController(): WorkbookController {
    return this.workbookController;
  }

  async saveApplicationState(): Promise<void> {
    console.log('[ApplicationController] Saving application state');
    const state = {
      workbook: this.workbookController.toJSON(),
      timestamp: new Date().toISOString()
    };
    await this.cacheService.cacheApplicationState(state);
  }

  async loadApplicationState(): Promise<boolean> {
    console.log('[ApplicationController] Loading application state');
    const state = await this.cacheService.getApplicationState();
    if (state && state.workbook) {
      this.workbookController.fromJSON(state.workbook);
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      workbook: this.workbookController.toJSON(),
      timestamp: new Date().toISOString()
    };
  }
} 