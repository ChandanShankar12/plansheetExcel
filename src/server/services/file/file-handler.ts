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
      

      // Process each sheet
      for (const sheet of spreadsheet.sheets) {
        try {
          // Initialize sheet data structure
         

          // Get all cells for this sheet from Redis
          const cellKeys = await redis.keys(`cell:${sheet.id}:*`);

          if (cellKeys.length > 0) {
            // Fetch all cell data at once
            const cellDataArray = await Promise.all(
              cellKeys.map((key) => redis.get(key))
            );

            // Process each cell's data
            cellDataArray.forEach((data, index) => {
              if (data) {
                try {
                  const cellData = JSON.parse(data);
                  const cellId = `${cellData.column}${cellData.row}`;

                  // Add cell to sheet with proper structure
                  sheetsData[sheet.id].cells[cellId] = {
                    id: cellData.id,
                    value: cellData.value,
                    formula: cellData.formula || '',
                    row: cellData.row,
                    column: cellData.column,
                    style: cellData.style || {},
                  };
                } catch (parseError) {
                  console.error(
                    `Error parsing cell data for key ${cellKeys[index]}:`,
                    parseError
                  );
                }
              }
            });
          }
        } catch (error) {
          console.error(`Error processing sheet ${sheet.id}:`, error);
          throw error;
        }
      }

      // Create DTST format with proper structure
      const dtstData = {
        header: {
          formatVersion: '1.0',
          fileType: 'COHO_SPREADSHEET',
          createdAt: workbook.getCreatedAt().toISOString(),
          lastModified: new Date().toISOString(),
          author: 'User123',
        },
        body: {
          application: {
            id: app.id,
            activeWorkbookId: workbook.id,
            workbooks: {
              id: workbook.id,
              theme: workbook.getTheme(),
              language: workbook.getConfig().language,
              timezone: workbook.getConfig().timezone,
              autoSave: workbook.isAutoSaveEnabled(),
              lastModified: workbook.getLastModified().toISOString(),
              spreadsheet: {
                activeSheetId: spreadsheet.activeSheetId,
                sheets: workbook.getSpreadsheet().sheets.map((sheet) => {
                  return {
                    id: sheet.id,
                    name: sheet.name,
                    cells: sheet.cells,
                  };
                }),
              },
            },
          },
        },
      }

      return dtstData as any;

    } catch (error) {
      console.error('Error in FileHandler.saveWorkbook:', error);
      throw error;
    }
  }

  static async loadWorkbook(content: string) {
    try {
      const data = JSON.parse(content);
      return Application.fromJSON(data.body.application);
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
