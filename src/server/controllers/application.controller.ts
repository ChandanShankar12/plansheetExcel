import { Application } from '../models/application';
import { Workbook } from '../models/workbook';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
  private static service = ApplicationService.getInstance();

  static getApplication(): Application {
    return this.service.getApplication();
  }

  static createWorkbook(): Workbook {
    return this.service.createWorkbook();
  }

  static getActiveWorkbook(): Workbook | undefined {
    return this.service.getActiveWorkbook();
  }

  static setActiveWorkbook(id: string): void {
    this.service.setActiveWorkbook(id);
  }

  static getAllWorkbooks(): Workbook[] {
    return this.service.getAllWorkbooks();
  }

  static async saveWorkbook(): Promise<void> {
    await this.service.saveWorkbook();
  }

  static async loadWorkbook(content: string): Promise<void> {
    await this.service.loadWorkbook(content);
  }
} 