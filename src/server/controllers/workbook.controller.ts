import { Sheet } from '../models/sheet';
import { Workbook } from '../models/workbook';
import { CacheService } from '../services/cache.service';

export class WorkbookController {
  private static _instance: WorkbookController | null = null;
  private readonly workbook: Workbook;
  private readonly cacheService: CacheService;

  private constructor() {
    console.log('[WorkbookController] Constructor called');
    this.workbook = Workbook.getInstance();
    this.cacheService = CacheService.getInstance();
    this.workbook.setCacheService(this.cacheService);
  }

  public static getInstance(): WorkbookController {
    if (!WorkbookController._instance) {
      console.log('[WorkbookController] Creating new instance');
      WorkbookController._instance = new WorkbookController();
    }
    return WorkbookController._instance;
  }

  async initialize(): Promise<void> {
    console.log('[WorkbookController] Initializing');
    await this.workbook.initialize();
  }

  getName(): string {
    return this.workbook.getName();
  }

  async addSheet(name?: string): Promise<Sheet> {
    console.log('[WorkbookController] Adding sheet:', { name });
    return await this.workbook.addSheet(name);
  }

  getSheets(): Sheet[] {
    return this.workbook.getSheets();
  }

  getSheet(id: number): Sheet | undefined {
    return this.workbook.getSheet(id);
  }

  async removeSheet(id: number): Promise<void> {
    console.log('[WorkbookController] Removing sheet:', { id });
    await this.workbook.removeSheet(id);
  }

  async syncState(): Promise<void> {
    console.log('[WorkbookController] Syncing state');
    await this.workbook.syncState();
  }

  toJSON() {
    return this.workbook.toJSON();
  }

  fromJSON(data: any): void {
    this.workbook.fromJSON(data);
  }
} 