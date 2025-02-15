import { Application } from '../models/application';
import { redis } from '../db/cache/redis_client';
import { FileHandler } from '../services/file/file-handler';

export class ApplicationController {
  static async saveWorkbook(app: Application) {
    try {
      const workbook = app.getActiveWorkbook();
      if (!workbook) throw new Error('No active workbook');

      // Get the DTST formatted data from FileHandler
      const dtstData = await FileHandler.saveWorkbook(app);
      
      if (!dtstData) {
        throw new Error('Failed to create DTST format');
      }

      return dtstData;

    } catch (error) {
      console.error('Error in ApplicationController.saveWorkbook:', error);
      throw error;
    }
  }
}


