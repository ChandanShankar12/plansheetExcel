import { Sheet } from './sheet';

export class Workbook {
  private _name: string;
  private _sheets: Map<number, Sheet>;
  private _nextSheetId: number;
  private _initialized: boolean = false;

  constructor(name: string = 'Untitled') {
    console.log('[Workbook] New workbook created with name:', name);
    this._name = name;
    this._sheets = new Map<number, Sheet>();
    this._nextSheetId = 1;
  }

  public getName(): string {
    return this._name;
  }

  public setName(name: string): void {
    this._name = name;
  }

  public isInitialized(): boolean {
    return this._initialized;
  }

  public async initialize(): Promise<void> {
    if (this._initialized) {
      console.log('[Workbook] Already initialized');
      return;
    }

    console.log('[Workbook] Initializing workbook');
    
    // If no sheets exist, create a default sheet
    if (this._sheets.size === 0) {
      console.log('[Workbook] Creating default sheet');
      await this.addSheet('Sheet 1');
      
      // Ensure the first sheet has ID 1
      if (!this._sheets.has(1)) {
        console.log('[Workbook] Ensuring sheet with ID 1 exists');
        const sheet = new Sheet('Sheet 1', 1);
        this._sheets.set(1, sheet);
        this._nextSheetId = Math.max(this._nextSheetId, 2);
      }
    }

    this._initialized = true;
    console.log('[Workbook] Initialization complete');
  }

  public async addSheet(name?: string): Promise<Sheet> {
    const sheetName = name || `Sheet ${this._nextSheetId}`;
    console.log('[Workbook] Adding sheet:', { name: sheetName, id: this._nextSheetId });
    
    const sheet = new Sheet(sheetName, this._nextSheetId);
    this._sheets.set(this._nextSheetId, sheet);
    
    // Increment sheet ID for next sheet
    this._nextSheetId++;
    
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
  }

  public toJSON() {
    return {
      name: this._name,
      nextSheetId: this._nextSheetId,
      sheets: this.getSheets().map(sheet => sheet.toJSON()),
      initialized: this._initialized
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
    
    if (data.initialized !== undefined) {
      this._initialized = data.initialized;
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