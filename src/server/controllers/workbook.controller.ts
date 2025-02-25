import { Workbook } from '../models/workbook';
import { getApplication } from './application.controller';

/**
 * Get the workbook instance from the application
 */
export function getWorkbook(): Workbook {
  const app = getApplication();
  return app.workbook;
}

/**
 * Get all sheets from the workbook
 */
export function getSheets() {
  const workbook = getWorkbook();
  return workbook.getSheets();
}

/**
 * Get a specific sheet by ID
 */
export function getSheet(id: number) {
  const workbook = getWorkbook();
  return workbook.getSheet(id);
}

/**
 * Add a new sheet to the workbook
 */
export async function addSheet(name?: string) {
  const workbook = getWorkbook();
  return await workbook.addSheet(name);
}

/**
 * Remove a sheet from the workbook
 */
export async function removeSheet(id: number) {
  const workbook = getWorkbook();
  await workbook.removeSheet(id);
  return { success: true };
}

/**
 * Get the workbook name
 */
export function getWorkbookName() {
  const workbook = getWorkbook();
  return workbook.getName();
}

/**
 * Set the workbook name
 */
export function setWorkbookName(name: string) {
  const workbook = getWorkbook();
  workbook.setName(name);
  return { success: true };
}

/**
 * Get workbook state as JSON
 */
export function getWorkbookState() {
  const workbook = getWorkbook();
  return workbook.toJSON();
}

/**
 * Restore workbook from JSON data
 */
export function restoreWorkbookState(data: any) {
  const workbook = getWorkbook();
  workbook.fromJSON(data);
  return { success: true };
} 