import { Sheet } from './sheet';

// Define the WorkbookConfig interface
export interface WorkbookConfig {
  theme: string;
  autoSave: boolean;
  [key: string]: any; // Allow for additional config properties
}

export class Workbook {
  private _name: string;
  private _sheets: Map<number, Sheet>;
  private _nextSheetId: number;
  private _initialized: boolean = false;
  private _id: number;
  private _config: WorkbookConfig;

  constructor(name: string = 'Untitled') {
    console.log('[Workbook] New workbook created with name:', name);
    this._name = name;
    this._sheets = new Map<number, Sheet>();
    this._nextSheetId = 1;
    this._id = Date.now(); // Assign a unique ID to the workbook
    // Initialize with default config
    this._config = {
      theme: 'light',
      autoSave: false
    };
  }

  public getId(): number {
    return this._id;
  }

  public getName(): string {
    return this._name;
  }

  public setName(name: string): void {
    this._name = name;
  }

  public getConfig(): WorkbookConfig {
    return this._config;
  }

  public setConfig(config: Partial<WorkbookConfig>): void {
    this._config = { ...this._config, ...config };
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
        const sheet = new Sheet('Sheet 1', 1, this._id);
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
    
    const sheet = new Sheet(sheetName, this._nextSheetId, this._id);
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

  public toJSON(includeFullCellData: boolean = false) {
    console.log(`[Workbook] Converting to JSON with includeFullCellData=${includeFullCellData}`);
    
    // Get all sheets with their data
    const sheetsData = this.getSheets().map(sheet => {
      // Get sheet data with or without full cell data based on parameter
      const sheetData = sheet.toJSON(includeFullCellData);
      
      // Log the sheet data for debugging
      console.log(`[Workbook] Sheet ${sheetData.id} has ${sheetData.cellIds?.length || 0} cell IDs`);
      
      return sheetData;
    });
    
    return {
      id: this._id,
      name: this._name,
      nextSheetId: this._nextSheetId,
      sheets: sheetsData,
      initialized: this._initialized,
      config: this._config
    };
  }

  public fromJSON(data: any): void {
    console.log('[Workbook] Restoring from JSON');
    
    if (data.id) {
      this._id = data.id;
    }
    
    if (data.name) {
      this._name = data.name;
    }
    
    if (data.nextSheetId) {
      this._nextSheetId = data.nextSheetId;
    }
    
    if (data.initialized !== undefined) {
      this._initialized = data.initialized;
    }
    
    if (data.config) {
      this._config = { ...this._config, ...data.config };
    }
    
    // Clear existing sheets
    this._sheets.clear();
    
    // Restore sheets from data
    if (data.sheets && Array.isArray(data.sheets)) {
      console.log(`[Workbook] Restoring ${data.sheets.length} sheets`);
      
      data.sheets.forEach((sheetData: any) => {
        try {
          // Log the sheet data for debugging
          console.log(`[Workbook] Restoring sheet ${sheetData.id} with ${sheetData.cellIds?.length || 0} cell IDs`);
          
          const sheet = Sheet.fromJSON(sheetData);
          
          // Ensure the sheet has the correct workbook ID
          sheet.setWorkbookId(this._id);
          
          this._sheets.set(sheet.getId(), sheet);
        } catch (error) {
          console.error(`[Workbook] Failed to restore sheet from JSON:`, error);
        }
      });
    } else {
      console.warn('[Workbook] No sheets found in JSON data');
    }
  }
}