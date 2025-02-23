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
  private static _instance: Workbook | null = null;
  private _sheets: Sheet[] = [];
  private _config: UserConfig;
  private _sequence = 1;

  constructor() {
    if (Workbook._instance) {
      return Workbook._instance;
    }

    console.log('[Workbook] Creating new instance');
    this._config = this.getDefaultConfig();
    
    console.log('[Workbook] Creating default sheet');
    this.addSheet('Sheet 1');
    
    Workbook._instance = this;
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
    const sheet = new Sheet(this._sequence++, name);
    this._sheets.push(sheet);
    return sheet;
  }

  getSheet(id: string): Sheet | undefined {
    return this._sheets.find(sheet => sheet.getId() === id);
  }

  removeSheet(id: string): void {
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

    // Clear existing sheets
    this._sheets.length = 0;

    // Load sheets and update next ID
    if (data.sheets?.length) {
      data.sheets.forEach((sheetData: any) => {
        const sheet = Sheet.fromJSON(sheetData);
        this._sheets.push(sheet);
        // Update _nextSheetId to be higher than any existing sheet ID
        this._sequence = Math.max(this._sequence, sheet.getId());
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