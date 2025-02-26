import { Sheet } from '../models/sheet';
import { SheetData } from '@/lib/types';
import { getSheet, getWorkbook } from './workbook.controller';
import { CellData } from '../models/cell';
import { 
  cacheSheet, 
  getSheetFromCache,
  cacheCellData,
  deleteCellFromCache
} from '../services/cache.service';

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
  const sheet = getSheet(id);
  
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
export async function createSheet(name?: string) {
  const workbook = getWorkbook();
  const sheet = await workbook.addSheet(name);
  
  // Cache the new sheet
  try {
    await cacheSheet(sheet.getId(), sheet.toJSON());
  } catch (error) {
    console.warn(`[SheetController] Failed to cache new sheet:`, error);
  }
  
  return sheet;
}

/**
 * Update sheet name
 */
export function updateSheetName(id: number, name: string) {
  const sheet = getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  sheet.setName(name);
  
  // Cache the updated sheet
  cacheSheet(id, sheet.toJSON()).catch(error => {
    console.warn(`[SheetController] Failed to cache sheet ${id} after rename:`, error);
  });
  
  return { success: true, sheet: sheet.toJSON() };
}

/**
 * Delete a sheet
 */
export async function deleteSheet(id: number) {
  const workbook = getWorkbook();
  await workbook.removeSheet(id);
  return { success: true };
}

/**
 * Get all cells in a sheet
 */
export function getSheetCells(id: number) {
  const sheet = getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  return sheet.getCellsData();
}

/**
 * Get a specific cell in a sheet
 */
export function getSheetCell(sheetId: number, cellId: string) {
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const cell = sheet.getCell(cellId);
  if (!cell) {
    return null;
  }
  
  return cell.toCellData();
}

/**
 * Update a cell in a sheet
 */
export function updateSheetCell(sheetId: number, cellId: string, updates: Partial<CellData>) {
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  sheet.updateCell(cellId, updates);
  const updatedCell = sheet.getCell(cellId);
  
  // Cache the updated cell and sheet
  if (updatedCell) {
    const cellData = updatedCell.toCellData();
    cacheCellData(sheetId, cellId, cellData).catch(error => {
      console.warn(`[SheetController] Failed to cache cell ${cellId} in sheet ${sheetId}:`, error);
    });
    
    cacheSheet(sheetId, sheet.toJSON()).catch(error => {
      console.warn(`[SheetController] Failed to cache sheet ${sheetId} after cell update:`, error);
    });
  }
  
  return updatedCell ? updatedCell.toCellData() : null;
}

/**
 * Delete a cell from a sheet
 */
export function deleteSheetCell(sheetId: number, cellId: string) {
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const success = sheet.deleteCell(cellId);
  
  if (success) {
    // Update cache
    deleteCellFromCache(sheetId, cellId).catch(error => {
      console.warn(`[SheetController] Failed to delete cell ${cellId} from cache:`, error);
    });
    
    cacheSheet(sheetId, sheet.toJSON()).catch(error => {
      console.warn(`[SheetController] Failed to cache sheet ${sheetId} after cell deletion:`, error);
    });
  }
  
  return { success };
}

/**
 * Get sheet data as JSON
 */
export function getSheetData(id: number) {
  const sheet = getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  return sheet.toJSON();
}

/**
 * Get all sheets
 */
export function getAllSheets() {
  const workbook = getWorkbook();
  return workbook.getSheets();
}

/**
 * Update sheet data
 */
export function updateSheet(id: number, updates: Partial<SheetData>) {
  const sheet = getSheet(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  if (updates.name) {
    sheet.setName(updates.name);
  }
  
  if (updates.cells) {
    Object.entries(updates.cells).forEach(([cellId, cellData]) => {
      sheet.updateCell(cellId, cellData);
    });
  }
  
  // Cache the updated sheet
  cacheSheet(id, sheet.toJSON()).catch(error => {
    console.warn(`[SheetController] Failed to cache sheet ${id} after update:`, error);
  });
  
  return { success: true, sheet: sheet.toJSON() };
} 