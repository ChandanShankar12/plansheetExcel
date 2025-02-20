import { Application } from '../models/application';
import { Workbook } from '../models/workbook';

export class ApplicationService {
  private static instance: ApplicationService | null = null;
  private application: Application;

  private constructor() {
    this.application = Application.getInstance();
  }

  static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  getCurrentWorkbook(): Workbook {
    return this.application.getWorkbook();
  }

  getAllWorkbooks(): Workbook[] {
    return this.application.getAllWorkbooks();
  }

  removeWorkbook(id: string): void {
    this.application.removeWorkbook(id);
  }

  saveApplicationState(): string {
    return JSON.stringify(this.application.toJSON());
  }

  loadApplicationState(state: string): void {
    const parsedState = JSON.parse(state);
    Application.fromJSON(parsedState);
  }
} 