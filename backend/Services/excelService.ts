import ExcelJS from 'exceljs';
import { Sheets, Column } from '../utils/sheets.js';
import { mapBoothDetailsToExcel } from './boothMapper.js';
import { PATHS } from '../utils/pathUtils.js';

export async function processExcelFile() {
    return mapBoothDetailsToExcel(PATHS.boothDetails, PATHS.outputDir);
} 