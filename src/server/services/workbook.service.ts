import { Application } from '../models/application';
import { Workbook } from '../models/workbook';
import { Sheet } from '../models/sheets';
import { UserConfig } from '../models/workbook';

export class WorkbookService {
  private static instance: WorkbookService | null = null;
  private application: Application;

  private constructor() {
    this.application = Application.getInstance();
  }

  static getInstance(): WorkbookService {
    if (!WorkbookService.instance) {
      WorkbookService.instance = new WorkbookService();
    }
    return WorkbookService.instance;
  }

  getWorkbook(): Workbook {
    return this.application.getWorkbook();
  }

  addSheet(name: string): Sheet {
    const workbook = this.getWorkbook();
    return workbook.addSheet(name);
  }

  updateSheetName(sheetId: number, name: string): void {
    const workbook = this.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    sheet.setName(name);
  }

  updateConfig(config: Partial<UserConfig>): void {
    const workbook = this.getWorkbook();
    workbook.updateConfig(config);
  }

  saveWorkbook(): string {
    const workbook = this.getWorkbook();
    return JSON.stringify(workbook.toJSON());
  }

  loadWorkbook(data: string): void {
    const parsedData = JSON.parse(data);
    Workbook.fromJSON(parsedData);
  }
} 