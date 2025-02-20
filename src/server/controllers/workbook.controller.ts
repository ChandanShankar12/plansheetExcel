import { WorkbookService } from '../services/workbook.service';

export class WorkbookController {
  private static instance: WorkbookController | null = null;
  private workbookService: WorkbookService;

  private constructor() {
    this.workbookService = WorkbookService.getInstance();
  }

  static getInstance(): WorkbookController {
    if (!WorkbookController.instance) {
      WorkbookController.instance = new WorkbookController();
    }
    return WorkbookController.instance;
  }

  async getWorkbook() {
    try {
      return this.workbookService.getWorkbook();
    } catch (error) {
      throw new Error('Failed to get workbook');
    }
  }

  async addSheet(name: string) {
    try {
      return this.workbookService.addSheet(name);
    } catch (error) {
      throw new Error('Failed to add sheet');
    }
  }

  async updateSheetName(sheetId: number, name: string) {
    try {
      return this.workbookService.updateSheetName(sheetId, name);
    } catch (error) {
      throw new Error('Failed to update sheet name');
    }
  }

  async updateConfig(config: Partial<UserConfig>) {
    try {
      return this.workbookService.updateConfig(config);
    } catch (error) {
      throw new Error('Failed to update config');
    }
  }
} 