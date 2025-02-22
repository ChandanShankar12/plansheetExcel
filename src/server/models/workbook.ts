import { Sheet } from './sheet';

export interface UserConfig {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  autoSave: boolean;
  lastModified: Date;
  createdAt: Date;
}

export class Workbook {
  private sheets: Sheet[];
  private _id: string;
  private config: UserConfig;
  private nextSheetId: number;

  constructor(id?: string) {
    this._id = id || crypto.randomUUID();
    this.sheets = [];
    this.nextSheetId = 1;
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): UserConfig {
    return {
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      autoSave: true,
      lastModified: new Date(),
      createdAt: new Date()
    };
  }

  public getId(): string {
    return this._id;
  }

  getSheets(): Sheet[] {
    return this.sheets;
  }

  ensureInitialSheet(): Sheet {
    if (this.sheets.length === 0) {
      console.log('Creating initial sheet for workbook');
      return this.addSheet('Sheet 1');
    }
    return this.sheets[0];
  }

  addSheet(name: string): Sheet {
    const id = this.nextSheetId++;
    console.log('Creating new sheet with ID:', id, 'Name:', name);
    const sheet = new Sheet(id, name);
    this.sheets.push(sheet);
    console.log('Current sheets:', this.sheets.map(s => ({
      id: s.getId(),
      name: s.getName()
    })));
    return sheet;
  }

  getSheet(id: number): Sheet | undefined {
    console.log('Looking for sheet with ID:', id);
    console.log('Available sheets:', this.sheets.map(s => ({
      id: s.getId(),
      name: s.getName()
    })));
    const sheet = this.sheets.find(sheet => sheet.getId() === id);
    if (!sheet) {
      console.error(`Sheet ${id} not found in workbook`);
    }
    return sheet;
  }

  removeSheet(id: number): void {
    this.sheets = this.sheets.filter(sheet => sheet.getId() !== id);
  }

  // Config methods
  getConfig(): UserConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<UserConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      lastModified: new Date()
    };
  }

  // Theme methods
  getTheme(): 'light' | 'dark' {
    return this.config.theme;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.config.theme = theme;
    this.config.lastModified = new Date();
  }

  // Auto-save methods
  isAutoSaveEnabled(): boolean {
    return this.config.autoSave;
  }

  setAutoSave(enabled: boolean): void {
    this.config.autoSave = enabled;
    this.config.lastModified = new Date();
  }

  // Timestamp methods
  getLastModified(): Date {
    return new Date(this.config.lastModified);
  }

  getCreatedAt(): Date {
    return new Date(this.config.createdAt);
  }

  // Save/Load methods
  toJSON() {
    return {
      workbookId: this._id,
      config: this.config,
      sheets: this.sheets.map(sheet => sheet.toJSON())
    };
  }

  public fromJSON(data: any): void {
    if (!data) return;
    
    this._id = data.workbookId || crypto.randomUUID();
    this.sheets = (data.sheets || []).map((sheetData: any) => Sheet.fromJSON(sheetData));
    this.config = {
      ...this.getDefaultConfig(),
      ...data.config,
      lastModified: new Date(data.config?.lastModified || Date.now()),
      createdAt: new Date(data.config?.createdAt || Date.now())
    };
    // Update nextSheetId based on existing sheets
    this.nextSheetId = Math.max(...this.sheets.map(s => s.getId()), 0) + 1;
    // Log for debugging
    console.log('Workbook loaded:', this._id, this.sheets.map(s => ({ id: s.getId(), name: s.getName() })));
  }

  static fromJSON(data: any): Workbook {
    const workbook = new Workbook(data?.workbookId);
    workbook.fromJSON(data);
    return workbook;
  }

  getSheetByName(name: string): Sheet | null {
    const cleanName = name.trim();
    return this.sheets.find(sheet => sheet.getName() === cleanName) || null;
  }
} 