const path = require('path');
const { Sheets, Column } = require('./sheets.js');
const exceljs = require('exceljs');
const {processColumnData, removeRichTextAndEntry, transformColumnH} = require('./app.js');
const fs = require('fs');



const plansheet_filepath = path.join(__dirname, '/__test__/ProcessFiles/MDA PLAN 2025.xlsx');
const microplansheet_filepath = path.join(__dirname, '/__test__/ProcessFiles/MDA PLAN 2025.xlsx');
const columnData_filepath = path.join(__dirname, './__test__/Processed_Files_Data/columns_data_A-N.json')
const processedDataColumn_filepath = path.join(__dirname, '__test__', 'Processed_Files_Data', 'processedColumnData.json');
const mainprocessedDataColumn_filepath = path.join(__dirname,  './Processed_Files_Data/processedColumnData.json');


// getColumnData(plansheet_filepath,'A:N');
processColumnData(['C','D','E','F','G','H','I'], columnData_filepath, processedDataColumn_filepath);

removeRichTextAndEntry(processedDataColumn_filepath);
transformColumnH(processedDataColumn_filepath);