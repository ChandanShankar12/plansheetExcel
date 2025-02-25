import { Sheet } from '../models/sheet';
import { SheetData } from '@/lib/types';
import { getSheet, getWorkbook } from './workbook.controller';
import { CellData } from '../models/cell';

/**
 * Get a sheet by ID
 */
export function getSheetById(id: number): Sheet | undefined {
  return getSheet(id);
}

/**
 * Create a new sheet
 */
export async function createSheet(name?: string) {
  const workbook = getWorkbook();
  return await workbook.addSheet(name);
}

/**
 * Update sheet name
 */
export function updateSheetName(id: number, name: string) {
  const sheet = getSheetById(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  sheet.setName(name);
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
  const sheet = getSheetById(id);
  if (!sheet) {
    throw new Error(`Sheet with ID ${id} not found`);
  }
  
  return sheet.getCellsData();
}

/**
 * Get a specific cell in a sheet
 */
export function getSheetCell(sheetId: number, cellId: string) {
  const sheet = getSheetById(sheetId);
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
  const sheet = getSheetById(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  sheet.updateCell(cellId, updates);
  const updatedCell = sheet.getCell(cellId);
  
  return updatedCell ? updatedCell.toCellData() : null;
}

/**
 * Delete a cell from a sheet
 */
export function deleteSheetCell(sheetId: number, cellId: string) {
  const sheet = getSheetById(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const success = sheet.deleteCell(cellId);
  return { success };
}

/**
 * Get sheet data as JSON
 */
export function getSheetData(id: number) {
  const sheet = getSheetById(id);
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
  const sheet = getSheetById(id);
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
  
  return { success: true, sheet: sheet.toJSON() };
} 