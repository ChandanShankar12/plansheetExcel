import { Spreadsheet } from './spreadsheet';


interface UserConfig {
 
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  autoSave: boolean;
  lastModified: Date;
  createdAt: Date;
}

export class Workbook {
  private spreadsheet: Spreadsheet;
  private config: UserConfig;
  public id: string;

  constructor() {
    this.id = Math.random().toString(36).substring(7);
    this.spreadsheet = new Spreadsheet();
    this.config = {
     
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      autoSave: true,
      lastModified: new Date(),
      createdAt: new Date()
    };
  }

  // Spreadsheet methods
  getSpreadsheet(): Spreadsheet {
    return this.spreadsheet;
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
      id: this.id,
      config: this.config,
      spreadsheet: this.spreadsheet
    };
  }

  static fromJSON(data: any): Workbook {
    const workbook = new Workbook();
    workbook.id = data.id;
    workbook.config = {
      ...data.config,
      lastModified: new Date(data.config.lastModified),
      createdAt: new Date(data.config.createdAt)
    };
    workbook.spreadsheet = Spreadsheet.fromJSON(data.spreadsheet);
    return workbook;
  }
} 