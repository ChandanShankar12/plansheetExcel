import { Sheet } from '../models/sheet';
import { getAppInstance } from '@/lib/app-instance';

export class WorkbookController {
  private static _instance: WorkbookController | null = null;
  private readonly workbook = getAppInstance().getWorkbook();

  private constructor() {
    console.log('[WorkbookController] Initializing');
  }

  public static get instance(): WorkbookController {
    if (!WorkbookController._instance) {
      WorkbookController._instance = new WorkbookController();
    }
    return WorkbookController._instance;
  }

  public async addSheet(name: string): Promise<Sheet> {
    console.log('[WorkbookController] Adding sheet:', name);
    return this.workbook.addSheet(name);
  }

  public getSheets(): Sheet[] {
    return this.workbook.getSheets();
  }

  public getSheet(id: number): Sheet | undefined {
    return this.workbook.getSheet(id);
  }

  public removeSheet(id: number): void {
    this.workbook.removeSheet(id);
  }
} 