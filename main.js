const path = require('path');
const { Sheets, Column } = require('./sheets.js');

// const filepath = path.join(__dirname, './ProcessFiles/test/Pre-Processed/MDA 2025MICRO PLAN CHAS/MDA 2025 MICRO PLAN CHAS.xlsx');
// Column.getColumnData(filepath, 'C', 'Sheet5', '1-1');

Sheets.processFiles(path.join(__dirname, './ProcessFiles/test/Pre-Processed/MDA '));
