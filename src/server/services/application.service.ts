import { Application } from '../models/application';
import { Workbook } from '../models/workbook';
import fs from 'fs/promises';
import path from 'path';

export class ApplicationService {
  private static instance: ApplicationService;
  private readonly dataDir: string;
  private readonly workbooksDir: string;

  private constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.workbooksDir = path.join(this.dataDir, 'workbooks');
    this.ensureDirectories();
  }

  static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.access(this.dataDir);
      await fs.access(this.workbooksDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.workbooksDir, { recursive: true });
    }
  }

  async saveWorkbook(): Promise<void> {
    try {
      const app = Application.getInstance();
      const workbook = app.getActiveWorkbook();
      if (!workbook) throw new Error('No active workbook');

      const data = this.createWorkbookData(workbook);
      const filePath = this.getWorkbookPath(workbook.id);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving workbook:', error);
      throw error;
    }
  }

  async loadWorkbook(workbookId: string): Promise<void> {
    try {
      const filePath = this.getWorkbookPath(workbookId);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      const workbook = Workbook.fromJSON(data.workbook);
      const app = Application.getInstance();
      app.setActiveWorkbook(workbook.id);
    } catch (error) {
      console.error('Error loading workbook:', error);
      throw error;
    }
  }

  private createWorkbookData(workbook: Workbook) {
    const spreadsheet = workbook.getSpreadsheet();
    const sheetsData: Record<string, any> = {};

    spreadsheet.getAllSheets().forEach(sheet => {
      const cells = sheet.getAllCells();
      const cellsData: Record<string, any> = {};

      cells.forEach((cell, cellId) => {
        if (cell.getValue() !== null) {
          cellsData[cellId] = {
            value: cell.getValue(),
            formula: cell.getFormula(),
            style: cell.style
          };
        }
      });

      sheetsData[sheet.id] = {
        id: sheet.id,
        name: sheet.name,
        cells: cellsData
      };
    });

    return {
      version: '1.0',
      workbook: {
        id: workbook.id,
        config: workbook.getConfig(),
        spreadsheet: {
          activeSheet: spreadsheet.getActiveSheet()?.id,
          sheets: Object.values(sheetsData)
        }
      }
    };
  }

  private getWorkbookPath(workbookId: string): string {
    return path.join(this.workbooksDir, `${workbookId}.json`);
  }

  getApplication(): Application {
    return Application.getInstance();
  }

  createWorkbook(): Workbook {
    const app = Application.getInstance();
    const workbook = app.createWorkbook();
    this.saveWorkbook().catch(console.error);
    return workbook;
  }

  getActiveWorkbook(): Workbook | undefined {
    const app = Application.getInstance();
    return app.getActiveWorkbook();
  }

  setActiveWorkbook(id: string): void {
    const app = Application.getInstance();
    app.setActiveWorkbook(id);
    this.saveWorkbook().catch(console.error);
  }

  getAllWorkbooks(): Workbook[] {
    const app = Application.getInstance();
    return app.getAllWorkbooks();
  }

  async listWorkbooks(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.workbooksDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.parse(file).name);
    } catch (error) {
      console.error('Error listing workbooks:', error);
      return [];
    }
  }
} 