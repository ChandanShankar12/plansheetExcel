import { Workbook } from '@/server/models/workbook';
import { Application } from '@/server/models/application';

export class FileHandler {
  static async saveWorkbook(workbook: Workbook): Promise<Blob> {
    const workbookData = workbook.toJSON();
    const content = JSON.stringify(workbookData, null, 2);
    return new Blob([content], { type: 'application/json' });
  }

  static async loadWorkbook(content: string): Promise<Workbook> {
    try {
      const data = JSON.parse(content);
      return Workbook.fromJSON(data);
    } catch (error) {
      console.error('Error parsing workbook file:', error);
      throw new Error('Invalid workbook file format');
    }
  }

  static async saveToLocalStorage(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static async loadFromLocalStorage(key: string): Promise<any> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  static async updateRecentFiles(filename: string): Promise<void> {
    try {
      const recentFiles = await this.loadFromLocalStorage('recentFiles') || [];
      const newFile = {
        name: filename,
        lastModified: new Date().toISOString(),
      };
      
      // Add to beginning, remove duplicates, keep only last 10
      const updatedFiles = [
        newFile,
        ...recentFiles.filter((f: any) => f.name !== filename)
      ].slice(0, 10);
      
      await this.saveToLocalStorage('recentFiles', updatedFiles);
    } catch (error) {
      console.error('Error updating recent files:', error);
    }
  }
} 