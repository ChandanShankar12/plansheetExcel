import { Sheet } from './sheet';
import { CacheService } from '../services/cache.service';

export class Workbook {
  private static _instance: Workbook | null = null;
  private _name: string;
  private _sheets: Map<number, Sheet>;
  private _nextSheetId: number;
  private cacheService: CacheService | null = null;

  constructor(name: string = 'default') {
    console.log('[Workbook] Constructor called');
    this._name = name;
    this._sheets = new Map<number, Sheet>();
    this._nextSheetId = 1;
  }

  public static getInstance(): Workbook {
    if (!Workbook._instance) {
      console.log('[Workbook] Creating new instance');
      Workbook._instance = new Workbook();
    }
    return Workbook._instance;
  }

  public static get instance(): Workbook {
    return Workbook.getInstance();
  }

  public setCacheService(cacheService: CacheService): void {
    this.cacheService = cacheService;
  }

  public getName(): string {
    return this._name;
  }

  public async initialize(): Promise<void> {
    console.log('[Workbook] Initializing workbook');
    
    // If no sheets exist, create a default sheet
    if (this._sheets.size === 0) {
      console.log('[Workbook] Creating default sheet');
      await this.addSheet('Sheet 1');
    }
  }

  public async addSheet(name?: string): Promise<Sheet> {
    const sheetName = name || `Sheet ${this._nextSheetId}`;
    console.log('[Workbook] Adding sheet:', { name: sheetName, id: this._nextSheetId });
    
    const sheet = new Sheet(sheetName, this._nextSheetId);
    this._sheets.set(this._nextSheetId, sheet);
    
    // Cache the new sheet
    if (this.cacheService) {
      try {
        await this.cacheService.cacheSheet(this._name, this._nextSheetId, sheet.toJSON());
      } catch (error) {
        console.warn('[Workbook] Failed to cache new sheet:', error);
      }
    }
    
    // Increment sheet ID for next sheet
    this._nextSheetId++;
    
    // Sync workbook state
    await this.syncState();
    
    return sheet;
  }

  public getSheets(): Sheet[] {
    return Array.from(this._sheets.values());
  }

  public getSheet(id: number): Sheet | undefined {
    return this._sheets.get(id);
  }

  public async removeSheet(id: number): Promise<void> {
    console.log('[Workbook] Removing sheet:', { id });
    
    if (!this._sheets.has(id)) {
      console.warn('[Workbook] Sheet not found:', id);
      return;
    }
    
    this._sheets.delete(id);
    
    // Sync workbook state
    await this.syncState();
  }

  public async syncState(): Promise<void> {
    console.log('[Workbook] Syncing state');
    
    if (this.cacheService) {
      try {
        await this.cacheService.cacheWorkbook(this._name, this.toJSON());
      } catch (error) {
        console.warn('[Workbook] Failed to sync state:', error);
      }
    }
  }

  public toJSON() {
    return {
      name: this._name,
      nextSheetId: this._nextSheetId,
      sheets: this.getSheets().map(sheet => sheet.toJSON())
    };
  }

  public fromJSON(data: any): void {
    console.log('[Workbook] Restoring from JSON');
    
    if (data.name) {
      this._name = data.name;
    }
    
    if (data.nextSheetId) {
      this._nextSheetId = data.nextSheetId;
    }
    
    // Clear existing sheets
    this._sheets.clear();
    
    // Restore sheets from data
    if (data.sheets) {
      data.sheets.forEach((sheetData: any) => {
        const sheet = Sheet.fromJSON(sheetData);
        this._sheets.set(sheet.getId(), sheet);
      });
    }
  }
}