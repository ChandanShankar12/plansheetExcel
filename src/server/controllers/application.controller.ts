import { ApplicationService } from '../services/application.service';
import { Workbook } from '../models/workbook';

export class ApplicationController {
  private static instance: ApplicationController | null = null;
  private applicationService: ApplicationService;

  private constructor() {
    this.applicationService = ApplicationService.getInstance();
  }

  static getInstance(): ApplicationController {
    if (!ApplicationController.instance) {
      ApplicationController.instance = new ApplicationController();
    }
    return ApplicationController.instance;
  }

  async getCurrentWorkbook(): Promise<Workbook> {
    try {
      return this.applicationService.getCurrentWorkbook();
    } catch (error) {
      throw new Error('Failed to get current workbook');
    }
  }

  async getAllWorkbooks(): Promise<Workbook[]> {
    try {
      return this.applicationService.getAllWorkbooks();
    } catch (error) {
      throw new Error('Failed to get all workbooks');
    }
  }

  async removeWorkbook(id: string): Promise<void> {
    try {
      return this.applicationService.removeWorkbook(id);
    } catch (error) {
      throw new Error('Failed to remove workbook');
    }
  }

  async saveApplicationState(): Promise<string> {
    try {
      return this.applicationService.saveApplicationState();
    } catch (error) {
      throw new Error('Failed to save application state');
    }
  }

  async loadApplicationState(state: string): Promise<void> {
    try {
      return this.applicationService.loadApplicationState(state);
    } catch (error) {
      throw new Error('Failed to load application state');
    }
  }
} 