const path = require('path');
const { Sheets, Column } = require('./sheets.js');
const ExcelJS = require('exceljs');
const {cleanJsonData} = require('./app.js');
const fs = require('fs');



const plansheet_filepath = path.join(__dirname, './__test__/ProcessFiles/MDA PLAN 2025.xlsx');
const microplansheet_filepath = path.join(__dirname, './__test__/ProcessFiles/MDA PLAN 2025.xlsx');
const columnData_filepath = path.join(__dirname, './__test__/Processed_Files_Data/columns_data_A-N.json')
// const processed_File_Data_filepath = path.join(__dirname, '__test__', 'Processed_Files_Data');
const mainprocessedDataColumn_filepath = path.join(__dirname,  './__test__/Processed_Files_Data/processedColumnData.json');
const pairedRowDataOutput_filepath = path.join(__dirname, './__test__/Processed_Files_Data/row_data_output.json');
const processedRowDataOutput_filepath = path.join(__dirname, './__test__/Processed_Files_Data/row_data_output.json');

// getColumnData(plansheet_filepath,'A:N');
// processColumnData(['C','D','E','F','G','H','I'], columnData_filepath, processedDataColumn_filepath);

// removeRichTextAndEntry(processedDataColumn_filepath);
// transformColumnH(processedDataColumn_filepath);


// const workbook = new ExcelJS.Workbook();

// workbook.xlsx.readFile(plansheet_filepath)
//     .then(workbook => {
//         const availableSheets = workbook.worksheets.map(sheet => sheet.name);
//         console.log('Available sheets:', availableSheets);
//     })
//     .catch(err => console.error(err));

// createPairedRowData(plansheet_filepath, pairedRowDataOutput_filepath);


cleanJsonData(processedRowDataOutput_filepath);