import { redis } from '@/server/db/cache/redis_client';
import { Application } from '@/server/models/application';

export class FileHandler {
  static async createDTSTFormat(app: Application) {
    // ... existing createDTSTFormat code ...
  }

  static async saveWorkbook(app: Application) {
    try {
      const workbook = app.getActiveWorkbook();
      if (!workbook) throw new Error('No active workbook');

      const spreadsheet = workbook.getSpreadsheet();
      const sheetsData: Record<string, any> = {};

      // Process each sheet
      for (const sheet of spreadsheet.sheets) {
        sheetsData[sheet.id] = {
          id: sheet.id,
          name: sheet.name,
          cells: {}
        };

        try {
          // Get all cells for this sheet from Redis
          const cellKeys = await redis.keys(`cell:${sheet.name}:*`);
          
          if (cellKeys.length > 0) {
            const cellDataArray = await Promise.all(
              cellKeys.map(key => redis.get(key))
            );

            cellDataArray.forEach((data) => {
              if (data) {
                try {
                  const cellData = JSON.parse(data);
                  sheetsData[sheet.id].cells[cellData.id] = cellData;
                } catch (parseError) {
                  console.error('Error parsing cell data:', parseError);
                }
              }
            });
          }

          // Include dirty cells from memory
          const sheetCells = sheet.getAllCells();
          sheetCells.forEach((cell, cellId) => {
            if (cell.isDirtyCell() && cell.getValue() !== null) {
              sheetsData[sheet.id].cells[cellId] = {
                id: cellId,
                value: cell.getValue(),
                formula: cell.getFormula(),
                style: cell.style
              };
            }
          });

        } catch (error) {
          console.error(`Error processing sheet ${sheet.name}:`, error);
          throw error;
        }
      }

      return {
        header: {
          formatVersion: '1.0',
          fileType: 'COHO_SPREADSHEET',
          createdAt: workbook.getCreatedAt().toISOString(),
          lastModified: new Date().toISOString(),
          author: 'User123'
        },
        body: {
          application: {
            id: app.id,
            activeWorkbookId: workbook.id,
            workbooks: [{
              id: workbook.id,
              theme: workbook.getTheme(),
              language: workbook.getConfig().language,
              timezone: workbook.getConfig().timezone,
              autoSave: workbook.isAutoSaveEnabled(),
              lastModified: workbook.getLastModified().toISOString(),
              spreadsheet: {
                activeSheetId: spreadsheet.activeSheetId,
                sheets: Object.values(sheetsData)
              }
            }]
          }
        }
      };
    } catch (error) {
      console.error('Error in FileHandler.saveWorkbook:', error);
      throw error;
    }
  }

  static async loadWorkbook(content: string) {
    try {
      const data = JSON.parse(content);
      const app = Application.fromJSON(data.body.application);

      // After loading the application, restore cell data to Redis
      const workbook = app.getActiveWorkbook();
      if (workbook) {
        const spreadsheet = workbook.getSpreadsheet();
        for (const sheet of spreadsheet.sheets) {
          const cells = sheet.getAllCells();
          for (const [cellId, cell] of cells) {
            if (cell.getValue() !== null) {
              const cellData = {
                id: cellId,
                value: cell.getValue(),
                formula: cell.getFormula(),
                style: cell.style
              };
              await redis.set(
                `cell:${sheet.name}:${cellId}`,
                JSON.stringify(cellData)
              );
            }
          }
        }
      }

      return app;
    } catch (error) {
      console.error('Error loading workbook:', error);
      throw error;
    }
  }

  static async loadFromCache(sheetId: string, cellId: string) {
    try {
      const key = `cell:${sheetId}:${cellId}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading cell from cache:', error);
      throw error;
    }
  }
}
