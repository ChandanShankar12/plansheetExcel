import { CellData } from '../models/cell';
import { getSheet } from './workbook.controller';
import { 
  cacheCellData, 
  getCellFromCache,
  deleteCellFromCache,
  cacheSheet
} from '../services/cache.service';

/**
 * Get a cell by ID from a specific sheet, trying cache first
 */
export async function getCell(sheetId: number, cellId: string) {
  // Try to get from cache first
  try {
    const cachedCell = await getCellFromCache(sheetId, cellId);
    if (cachedCell) {
      console.log(`[CellController] Cell ${cellId} in sheet ${sheetId} loaded from cache`);
      return cachedCell;
    }
  } catch (error) {
    console.warn(`[CellController] Failed to get cell ${cellId} from cache:`, error);
  }
  
  // Fall back to getting from sheet
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const cell = sheet.getCell(cellId);
  if (!cell) {
    return null;
  }
  
  const cellData = cell.toCellData();
  
  // Cache the cell data
  cacheCellData(sheetId, cellId, cellData).catch(error => {
    console.warn(`[CellController] Failed to cache cell ${cellId}:`, error);
  });
  
  return cellData;
}

/**
 * Update a cell in a sheet
 */
export function updateCell(sheetId: number, cellId: string, updates: Partial<CellData>) {
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  sheet.updateCell(cellId, updates);
  const updatedCell = sheet.getCell(cellId);
  
  if (updatedCell) {
    const cellData = updatedCell.toCellData();
    
    // Cache the updated cell
    cacheCellData(sheetId, cellId, cellData).catch(error => {
      console.warn(`[CellController] Failed to cache cell ${cellId} after update:`, error);
    });
    
    // Cache the updated sheet
    cacheSheet(sheetId, sheet.toJSON()).catch(error => {
      console.warn(`[CellController] Failed to cache sheet ${sheetId} after cell update:`, error);
    });
    
    return cellData;
  }
  
  return null;
}

/**
 * Delete a cell from a sheet
 */
export function deleteCell(sheetId: number, cellId: string) {
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const success = sheet.deleteCell(cellId);
  
  if (success) {
    // Remove from cache
    deleteCellFromCache(sheetId, cellId).catch(error => {
      console.warn(`[CellController] Failed to delete cell ${cellId} from cache:`, error);
    });
    
    // Update sheet in cache
    cacheSheet(sheetId, sheet.toJSON()).catch(error => {
      console.warn(`[CellController] Failed to cache sheet ${sheetId} after cell deletion:`, error);
    });
  }
  
  return { success };
}

/**
 * Get all cells from a sheet
 */
export function getAllCells(sheetId: number) {
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  return sheet.getCellsData();
}

/**
 * Update multiple cells in a sheet
 */
export function updateMultipleCells(sheetId: number, cellUpdates: Record<string, Partial<CellData>>) {
  const sheet = getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const updatedCells: Record<string, CellData> = {};
  
  Object.entries(cellUpdates).forEach(([cellId, updates]) => {
    sheet.updateCell(cellId, updates);
    const cell = sheet.getCell(cellId);
    if (cell) {
      const cellData = cell.toCellData();
      updatedCells[cellId] = cellData;
      
      // Cache each updated cell
      cacheCellData(sheetId, cellId, cellData).catch(error => {
        console.warn(`[CellController] Failed to cache cell ${cellId} after batch update:`, error);
      });
    }
  });
  
  // Cache the updated sheet
  cacheSheet(sheetId, sheet.toJSON()).catch(error => {
    console.warn(`[CellController] Failed to cache sheet ${sheetId} after batch cell update:`, error);
  });
  
  return { success: true, cells: updatedCells };
} 