const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const { Console } = require('console');


const workbook = new ExcelJS.Workbook();
let columnData = {}; // Declare columnData in global scope

// Get Column Data
async function getColumnDataBySheet(filePath, columnKey, sheetName = null, cellRange = null) {
    // Create workbook and load the file
    await workbook.xlsx.readFile(filePath);

    // 1. Get and log the folder name
    const folderName = path.dirname(filePath);
    console.log('Folder name:', folderName);

    // Get the worksheet (active sheet if sheetName not provided)
    let worksheet;
    if (sheetName) {
        worksheet = workbook.getWorksheet(sheetName);
        if (!worksheet) {
            throw new Error(`Sheet "${sheetName}" not found in the workbook`);
        }
    } else {
        worksheet = workbook.worksheets[0];
        console.log('Using active sheet:', worksheet.name);
    }

    // Function to get column data with optional range filtering
    const getColumnData = (columnKey, cellRange) => {

        const column = worksheet.getColumn(columnKey);
        
        column.eachCell((cell, rowNumber) => {
            const cellAddress = `${columnKey}${rowNumber}`;
            columnData[cellAddress] = cell.value;
        });

        // If cell range is provided, filter the data
        if (cellRange) {
            const [startRow, endRow] = cellRange.split('-').map(num => parseInt(num));
            const rangeColumnCellData = {};
            
            Object.entries(columnData).forEach(([cellAddress, value]) => {
                const rowNumber = parseInt(cellAddress.match(/\d+/)[0]);
                if (rowNumber >= startRow && rowNumber <= endRow) {
                    rangeColumnCellData[cellAddress] = value;
                }
            });
            
            console.log('Filtered Column Data for range', cellRange + ':', rangeColumnCellData);
            return rangeColumnCellData;
        }

        return columnData;
    };

    // Get the column data using the provided columnKey and optional cellRange
    columnData = getColumnData(columnKey, cellRange);
    console.log('Complete Column Data:', columnData);

    // Write changes back to file
    await workbook.xlsx.writeFile(filePath);

    return {
        columnData
    };
}

// Example usage with all parameters
getColumnDataBySheet(
    path.join(path.parse(__dirname).dir, '/ProcessFiles/test/MDA 2025MICRO PLAN CHAS/MDA 2025 MICRO PLAN CHAS.xlsx'),
    'C', // Column key (A, B, C, etc.)
    'Sheet5', // Optional: Sheet name
    '2-5'    // Optional: Cell range (e.g., '2-5' for rows 2 through 5)
);




console.log(columnData)