import { Application } from '../models/application';
import { CacheService } from '../services/cache.service';
import { Workbook } from '../models/workbook';

export class ApplicationController {
  private static instance: ApplicationController | null = null;
  private application: Application;
  private cacheService: CacheService;

  private constructor() {
    this.application = Application.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  static getInstance(): ApplicationController {
    if (!ApplicationController.instance) {
      ApplicationController.instance = new ApplicationController();
    }
    return ApplicationController.instance;
  }

  getCurrentWorkbook(): Workbook {
    try {
      return this.application.getWorkbook();
    } catch (error) {
      throw new Error('Failed to get current workbook');
    }
  }

  getAllWorkbooks(): Workbook[] {
    try {
      return this.application.getAllWorkbooks();
    } catch (error) {
      throw new Error('Failed to get all workbooks');
    }
  }

  async removeWorkbook(id: string): Promise<void> {
    try {
      this.application.removeWorkbook(id);
      await this.cacheService.clearWorkbookCache(id);
    } catch (error) {
      throw new Error('Failed to remove workbook');
    }
  }

  async saveApplicationState(): Promise<string> {
    try {
      const state = this.application.toJSON();
      const workbook = this.application.getWorkbook();
      await this.cacheService.cacheSheet(
        workbook.getId(),
        0,
        state
      );
      return JSON.stringify(state);
    } catch (error) {
      throw new Error('Failed to save application state');
    }
  }

  async loadApplicationState(state: string): Promise<void> {
    try {
      const parsedState = JSON.parse(state);
      Application.fromJSON(parsedState);
    } catch (error) {
      throw new Error('Failed to load application state');
    }
  }
} 