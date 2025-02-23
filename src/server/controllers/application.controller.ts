import { Application } from '../models/application';
import { CacheService } from '../services/cache.service';
import { Workbook } from '../models/workbook';

export class ApplicationController {
  private static _instance: ApplicationController | null = null;
  private readonly application: Application;
  private readonly cacheService: CacheService;

  private constructor() {
    this.application = Application.instance;
    this.cacheService = CacheService.instance;
  }

  public static get instance(): ApplicationController {
    if (!ApplicationController._instance) {
      ApplicationController._instance = new ApplicationController();
    }
    return ApplicationController._instance;
  }

  getCurrentWorkbook(): Workbook {
    try {
      return this.application.getWorkbook();
    } catch (error) {
      throw new Error('Failed to get current workbook');
    }
  }

  async saveApplicationState(): Promise<string> {
    try {
      const state = this.application.toJSON();
      const workbook = this.application.getWorkbook();
      await this.cacheService.cacheSheet(
        workbook.getName(),
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