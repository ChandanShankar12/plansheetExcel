import { Sheet } from '../models/sheet';
import { SheetData } from '@/lib/types';
import { getSheet, getWorkbook } from './workbook.controller';
import { CellData } from '@/lib/types';
import { 
  cacheSheet, 
  getSheetFromCache,
  cacheCellData,
  deleteCellFromCache,
  cacheWorkbook,
  getCellFromCache,
  getSheetCellIds
} from '../services/cache.service';
import { Cell } from '../models/cell';

/**
 * Get a sheet by ID, trying cache first
 */
export async function getSheetById(id: number): Promise<Sheet | undefined> {
  // Try to get from cache first
  try {
    const cachedSheet = await getSheetFromCache(id);
    if (cachedSheet) {
      console.log(`[SheetController] Sheet ${id} loaded from cache`);
      return Sheet.fromJSON(cachedSheet);
    }
  } catch (error) {
    console.warn(`[SheetController] Failed to get sheet ${id} from cache:`, error);
  }
  
  // Fall back to getting from workbook
  const sheet = await getSheet(id);
  
  // Cache the sheet if found
  if (sheet) {
    try {
      await cacheSheet(id, sheet.toJSON());
    } catch (error) {
      console.warn(`[SheetController] Failed to cache sheet ${id}:`, error);
    }
  }
  
  return sheet;
}

/**
 * Create a new sheet
 */
export async function createSheet(name: string): Promise<Sheet> {
  try {
    // Get the current workbook
    const workbook = await getWorkbook();
    
    // Use the workbook's addSheet method to create a new sheet
    const sheet = await workbook.addSheet(name);
    
    console.log(`[SheetController] Created sheet: ${sheet.getId()} - ${sheet.getName()} for workbook: ${workbook.getId()}`);
    
    // Cache the sheet
    try {
      const cached = await cacheSheet(sheet.getId(), sheet.toJSON());
      console.log(`[SheetController] Sheet cached: ${cached}`);
      
      // Also cache the updated workbook
      await cacheWorkbook(workbook.toJSON());
    } catch (error) {
      console.error('[SheetController] Error caching sheet:', error);
    }
    
    return sheet;
  } catch (error) {
    console.error('[SheetController] Error creating sheet:', error);
    throw error;
  }
}

/**
 * Update sheet name
 */
export async function updateSheetName(id: number, name: string) {
  const sheet = await getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  sheet.setName(name);
  
  // Cache the updated sheet
  try {
    await cacheSheet(id, sheet.toJSON());
  } catch (error) {
    console.warn(`[SheetController] Failed to cache sheet ${id} after rename:`, error);
  }
  
  return { success: true, sheet: sheet.toJSON() };
}

/**
 * Delete a sheet
 */
export async function deleteSheet(id: number) {
  const workbook = await getWorkbook();
  await workbook.removeSheet(id);
  return { success: true };
}

/**
 * Get all cells in a sheet
 */
export async function getSheetCells(id: number) {
  const sheet = await getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  return sheet.getCellsData();
}

/**
 * Get a specific cell in a sheet
 */
export async function getSheetCell(sheetId: number, cellId: string) {
  const sheet = await getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const cell = sheet.getCell(cellId);
  if (!cell) {
    return null;
  }
  
  return cell;
}

/**
 * Update a cell in a sheet
 */
export async function updateCell(sheetId: number, cellId: string, cellData: CellData): Promise<boolean> {
  try {
    // Get the sheet
    const sheet = await getSheet(sheetId);
    if (!sheet) {
      console.error(`[SheetController] Sheet not found: ${sheetId}`);
      return false;
    }
    
    // Update the cell in the sheet
    sheet.updateCell(cellId, cellData);
    
    // Cache the updated cell data separately
    try {
      const cached = await cacheCellData(sheetId, cellId, cellData);
      console.log(`[SheetController] Cell ${cellId} cached for sheet ${sheetId}: ${cached}`);
    } catch (error) {
      console.error(`[SheetController] Error caching cell ${cellId}:`, error);
    }
    
    // Cache the updated sheet (without cell data, as it's now stored separately)
    try {
      const cached = await cacheSheet(sheetId, sheet.toJSON());
      console.log(`[SheetController] Sheet ${sheetId} cached after cell update: ${cached}`);
    } catch (error) {
      console.error(`[SheetController] Error caching sheet ${sheetId} after cell update:`, error);
    }
    
    return true;
  } catch (error) {
    console.error(`[SheetController] Error updating cell ${cellId} in sheet ${sheetId}:`, error);
    return false;
  }
}

/**
 * Delete a cell from a sheet
 */
export async function deleteSheetCell(sheetId: number, cellId: string) {
  const sheet = await getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const success = sheet.deleteCell(cellId);
  
  if (success) {
    // Update cache
    try {
      await deleteCellFromCache(sheetId, cellId);
      await cacheSheet(sheetId, sheet.toJSON());
    } catch (error) {
      console.warn(`[SheetController] Failed to update cache after cell deletion:`, error);
    }
  }
  
  return { success };
}

/**
 * Get sheet data as JSON
 */
export async function getSheetData(id: number) {
  const sheet = await getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  return sheet.toJSON();
}

/**
 * Get all sheets
 */
export async function getAllSheets() {
  const workbook = await getWorkbook();
  return workbook.getSheets();
}

/**
 * Get all cells for a sheet
 */
export async function getSheetCellsFromCache(sheetId: number): Promise<Record<string, CellData>> {
  try {
    console.log(`[SheetController] Getting cells from cache for sheet ${sheetId}`);
    
    // Get the sheet from cache
    const cachedSheet = await getSheetFromCache(sheetId);
    if (!cachedSheet) {
      console.log(`[SheetController] Sheet ${sheetId} not found in cache`);
      return {};
    }
    
    // Get the cell IDs from the sheet
    const cellIds = cachedSheet.cellIds || [];
    console.log(`[SheetController] Sheet ${sheetId} has ${cellIds.length} cell IDs in cache`);
    
    // Get each cell from cache
    const cells: Record<string, CellData> = {};
    for (const cellId of cellIds) {
      const cellData = await getCellFromCache(sheetId, cellId);
      if (cellData) {
        // Create a deep copy to prevent reference issues
        cells[cellId] = JSON.parse(JSON.stringify(cellData));
      } else {
        // If not in cache, try to get from sheet
        const sheet = await getSheet(sheetId);
        if (sheet) {
          const sheetCell = sheet.getCell(cellId);
          if (sheetCell) {
            cells[cellId] = JSON.parse(JSON.stringify(sheetCell));
            // Also cache this cell for future use
            await cacheCellData(sheetId, cellId, sheetCell);
          }
        }
      }
    }
    
    console.log(`[SheetController] Loaded ${Object.keys(cells).length} cells for sheet ${sheetId}`);
    return cells;
  } catch (error) {
    console.error(`[SheetController] Error getting cells for sheet ${sheetId}:`, error);
    return {};
  }
}

/**
 * Update sheet data
 */
export async function updateSheet(id: number, updates: Partial<SheetData>) {
  const sheet = await getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  if (updates.name) {
    sheet.setName(updates.name);
  }
  
  if (updates.cells) {
    Object.entries(updates.cells).forEach(([cellId, cellData]) => {
      sheet.updateCell(cellId, cellData);
      
      // Also cache each updated cell individually
      try {
        cacheCellData(id, cellId, cellData);
      } catch (error) {
        console.warn(`[SheetController] Failed to cache cell ${cellId} for sheet ${id} during update:`, error);
      }
    });
  }
  
  // Cache the updated sheet
  try {
    await cacheSheet(id, sheet.toJSON());
  } catch (error) {
    console.warn(`[SheetController] Failed to cache sheet ${id} after update:`, error);
  }
  
  return { success: true, sheet: sheet.toJSON() };
} 