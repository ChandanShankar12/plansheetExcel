import { Sheet } from './sheet';

export interface UserConfig {
  name: string;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  autoSave: boolean;
  lastModified: Date;
  createdAt: Date;
}

export class Workbook {
  private static _nextSheetId = 1;
  private static _initialized = false;
  private readonly _sheets: Sheet[];
  private _config: UserConfig;

  constructor() {
    if (!Workbook._initialized) {
      console.log('[Workbook] Initializing new workbook');
      this._sheets = [];
      this._config = this.getDefaultConfig();
      
      // Create default sheet with ID 1
      console.log('[Workbook] Creating default sheet');
      this.addSheet('Sheet 1');
      
      Workbook._initialized = true;
    }
  }

  private getDefaultConfig(): UserConfig {
    return {
      name: 'Untitled',
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      autoSave: true,
      lastModified: new Date(),
      createdAt: new Date()
    };
  }

  getName(): string {
    return this._config.name;
  }

  setName(name: string): void {
    this._config.name = name.trim();
  }

  getSheets(): Sheet[] {
    console.log('[Workbook] Getting sheets, count:', this._sheets.length);
    return this._sheets;
  }

  addSheet(name: string): Sheet {
    console.log('[Workbook] Adding new sheet:', name);
    const id = Workbook._nextSheetId++;
    const sheet = new Sheet(id, name);
    console.log('[Workbook] Created sheet:', { id: sheet.getId(), name: sheet.getName() });
    this._sheets.push(sheet);
    return sheet;
  }

  getSheet(id: number): Sheet | undefined {
    console.log('Looking for sheet with ID:', id);
    console.log('Available sheets:', this._sheets.map(s => ({
      id: s.getId(),
      name: s.getName()
    })));
    const sheet = this._sheets.find(sheet => sheet.getId() === id);
    if (!sheet) {
      console.error(`Sheet ${id} not found in workbook`);
    }
    return sheet;
  }

  removeSheet(id: number): void {
    this._sheets = this._sheets.filter(sheet => sheet.getId() !== id);
  }

  // Config methods
  getConfig(): UserConfig {
    return { ...this._config };
  }

  updateConfig(updates: Partial<UserConfig>): void {
    this._config = {
      ...this._config,
      ...updates,
      lastModified: new Date()
    };
  }

  // Theme methods
  getTheme(): 'light' | 'dark' {
    return this._config.theme;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._config.theme = theme;
    this._config.lastModified = new Date();
  }

  // Auto-save methods
  isAutoSaveEnabled(): boolean {
    return this._config.autoSave;
  }

  setAutoSave(enabled: boolean): void {
    this._config.autoSave = enabled;
    this._config.lastModified = new Date();
  }

  // Timestamp methods
  getLastModified(): Date {
    return new Date(this._config.lastModified);
  }

  getCreatedAt(): Date {
    return new Date(this._config.createdAt);
  }

  // Save/Load methods
  toJSON() {
    return {
      name: this._config.name,
      config: this._config,
      sheets: this._sheets.map(sheet => sheet.toJSON())
    };
  }

  fromJSON(data: any): void {
    if (!data) return;
    
    this._config = {
      ...this.getDefaultConfig(),
      ...data.config
    };

    // Clear existing sheets and load from data
    this._sheets.length = 0;
    if (data.sheets?.length) {
      data.sheets.forEach((sheetData: any) => {
        const sheet = Sheet.fromJSON(sheetData);
        this._sheets.push(sheet);
        // Update _nextSheetId to be higher than any existing sheet ID
        Workbook._nextSheetId = Math.max(Workbook._nextSheetId, sheet.getId() + 1);
      });
    }

    console.log('[Workbook] Loaded:', {
      name: this._config.name,
      sheets: this._sheets.map(s => ({ id: s.getId(), name: s.getName() }))
    });
  }

  static fromJSON(data: any): Workbook {
    const workbook = new Workbook();
    workbook.fromJSON(data);
    return workbook;
  }

  getSheetByName(name: string): Sheet | null {
    const cleanName = name.trim();
    return this._sheets.find(sheet => sheet.getName() === cleanName) || null;
  }
}   