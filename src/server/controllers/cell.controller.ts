import { CellData } from '../models/cell';
import { getSheetById } from './sheet.controller';

/**
 * Get a cell by ID from a specific sheet
 */
export function getCell(sheetId: number, cellId: string) {
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
export function updateCell(sheetId: number, cellId: string, updates: Partial<CellData>) {
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
export function deleteCell(sheetId: number, cellId: string) {
  const sheet = getSheetById(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const success = sheet.deleteCell(cellId);
  return { success };
}

/**
 * Get all cells from a sheet
 */
export function getAllCells(sheetId: number) {
  const sheet = getSheetById(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  return sheet.getCellsData();
}

/**
 * Update multiple cells in a sheet
 */
export function updateMultipleCells(sheetId: number, cellUpdates: Record<string, Partial<CellData>>) {
  const sheet = getSheetById(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const updatedCells: Record<string, CellData> = {};
  
  Object.entries(cellUpdates).forEach(([cellId, updates]) => {
    sheet.updateCell(cellId, updates);
    const cell = sheet.getCell(cellId);
    if (cell) {
      updatedCells[cellId] = cell.toCellData();
    }
  });
  
  return { success: true, cells: updatedCells };
} 