import { Sheet } from './sheets';

export interface UserConfig {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  autoSave: boolean;
  lastModified: Date;
  createdAt: Date;
}

export class Workbook {
  private static instance: Workbook | null = null;
  private sheets: Sheet[] = [];
  private readonly id: string;
  private config: UserConfig;

  private constructor() {
    this.id = crypto.randomUUID();
    this.sheets.push(new Sheet(0, 'Sheet1', this.id));
    this.config = {
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      autoSave: true,
      lastModified: new Date(),
      createdAt: new Date()
    };
  }

  static getInstance(): Workbook {
    if (!Workbook.instance) {
      Workbook.instance = new Workbook();
    }
    return Workbook.instance;
  }

  getId(): string {
    return this.id;
  }

  getSheets(): Sheet[] {
    return this.sheets;
  }

  addSheet(name: string): Sheet {
    const newSheet = new Sheet(this.sheets.length, name, this.id);
    this.sheets.push(newSheet);
    return newSheet;
  }

  getSheet(id: number): Sheet | undefined {
    return this.sheets.find(sheet => sheet.id === id);
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
      workbookId: this.id,
      config: this.config,
      sheets: this.sheets.map(sheet => sheet.toJSON())
    };
  }

  static fromJSON(data: any): Workbook {
    if (!Workbook.instance) {
      Workbook.instance = new Workbook();
    }
    const workbook = Workbook.instance;
    workbook.sheets = data.sheets.map((sheetData: any) => Sheet.fromJSON(sheetData));
    workbook.config = {
      ...data.config,
      lastModified: new Date(data.config.lastModified),
      createdAt: new Date(data.config.createdAt)
    };
    return workbook;
  }
} 