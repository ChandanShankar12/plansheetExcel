const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');


function getBlankRowsColumns(filepath, sheetName, workbook) {
    return workbook.xlsx.readFile(filepath)
        .then(() => {
            const result = {
                emptyRows: [],
                emptyColumns: []
            };

            const worksheet = sheetName 
                ? workbook.getWorksheet(sheetName)
                : workbook.worksheets[0];

            if (!worksheet) {
                throw new Error('Worksheet not found');
            }

            // Check for empty rows
            worksheet.eachRow((row, rowNumber) => {
                const isRowEmpty = row.values.slice(1).every(cell => !cell);
                if (isRowEmpty) {
                    result.emptyRows.push(rowNumber);
                }
            });

            // Check for empty columns
            const usedRange = worksheet.usedRange;
            if (usedRange) {
                for (let col = 1; col <= worksheet.columnCount; col++) {
                    let isColumnEmpty = true;
                    for (let row = 1; row <= worksheet.rowCount; row++) {
                        const cell = worksheet.getCell(row, col);
                        if (cell.value !== null && cell.value !== undefined) {
                            isColumnEmpty = false;
                            break;
                        }
                    }
                    if (isColumnEmpty) {
                        result.emptyColumns.push(col);
                    }
                }
            }

            return result;
        });
};

module.exports = {
    getBlankRowsColumns: function(filepath, sheetName, workbook) {
        // your function implementation
    }
};

// export function getSheets(filepath) {
//     const workbook = new ExcelJS.Workbook();
//     const sheets = workbook.xlsx.readFile(filepath)
//         .then(() => {
//             const sheetNames = workbook.worksheets.map(sheet => sheet.name);
//             console.log('Available sheets:', sheetNames);
//             return sheetNames;
//         });
//     return sheets;
// };


function removeSheetBorder(filepath, sheetName) {
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx.readFile(filepath)
        .then(() => {
            if (sheetName) {
                // Get specific worksheet if sheetName provided
                const worksheet = workbook.worksheets.find(sheet => sheet.name === sheetName);
                if (!worksheet) {
                    // List available sheets in the error message
                    const availableSheets = workbook.worksheets.map(sheet => sheet.name);
                    throw new Error(`Sheet "${sheetName}" not found in workbook. Available sheets: ${availableSheets.join(', ')}`);
                }
                // Process the specific sheet
                worksheet.eachRow({ includeEmpty: false }, row => {
                    row.eachCell({ includeEmpty: false }, cell => {
                        cell.border = { noBorder: true };
                    });
                });
            } else {
                // Process all worksheets if no sheetName provided
                workbook.worksheets.forEach(worksheet => {
                    worksheet.eachRow({ includeEmpty: false }, row => {
                        row.eachCell({ includeEmpty: false }, cell => {
                            cell.border = {
                                top: { style: 'none' },
                                left: { style: 'none' },
                                bottom: { style: 'none' },
                                right: { style: 'none' }
                            };
                        });
                    });
                });
            }
            return workbook.xlsx.writeFile(filepath);
        });
};










// const Sheets = {
    
    
//     extensionConversion(filepath) {
//         try {
//             if (!fs.existsSync(this.rootPath)) {
//                 throw new Error(`Root directory ${this.rootPath} does not exist`);
//             } 

//             // Clean or create convertedFiles directory
//             if (fs.existsSync(this.convertedPath)) {
//                 console.log('Cleaning existing converted files directory...');
//                 fs.rmSync(this.convertedPath, { recursive: true });
//             }
//             fs.mkdirSync(this.convertedPath);
//             console.log('✓ Initialized converted files directory');
//             return true;
//         } catch (error) {
//             console.error('✗ Initialization failed:', error.message);
//             return false;
//         }
//     },

//     isExcelFile(filename) {
//         const ext = path.extname(filename).toLowerCase();
//         return ext === '.xls' || ext === '.xlsx';
//     },

//     processFile(filePath) {
//         const filename = path.basename(filePath);
//         const newPath = path.join(this.convertedPath, `${path.parse(filename).name}.xlsx`);

//         try {
//             const workbook = new ExcelJS.Workbook();
//             workbook.xlsx.readFile(filePath);
//             workbook.xlsx.writeFile(newPath);
            
//             this.stats.successful++;
//             this.stats.processedFiles.success.push(filename);
//             console.log(`✓ Converted: ${filename}`);
//             return true;
//         } catch (error) {
//             this.stats.failed++;
//             this.stats.processedFiles.failed.push({
//                 file: filename,
//                 error: error.message
//             });
//             console.error(`✗ Failed to convert ${filename}: ${error.message}`);
//             return false;
//         }
//     },

//     generateReport() {
//         console.log('\n=== Excel Processing Report ===');
//         console.log(`Total files processed: ${this.stats.totalFiles}`);
//         console.log(`Successful conversions: ${this.stats.successful}`);
//         console.log(`Failed conversions: ${this.stats.failed}`);
        
//         if (this.stats.failed > 0) {
//             console.log('\nFailed Files:');
//             this.stats.processedFiles.failed.forEach(failure => {
//                 console.log(`- ${failure.file}: ${failure.error}`);
//             });
//         }
//     },

//     processXlsFile(filePath) {
//         const filename = path.basename(filePath);
//         const newPath = path.join(this.convertedPath, `${path.parse(filename).name}.xlsx`);

//         try {
//             // Step 1: Read XLS file using XLSX (better for old Excel formats)
//             const workbook = XLSX.readFile(filePath, {
//                 cellStyles: true,
//                 cellNF: true,
//                 cellFormula: true
//             });

//             // Step 2: Convert to XLSX format
//             const tempPath = path.join(this.convertedPath, 'temp.xlsx');
//             XLSX.writeFile(workbook, tempPath);

//             // Step 3: Use ExcelJS to preserve additional formatting
//             const excelWorkbook = new ExcelJS.Workbook();
//             excelWorkbook.xlsx.readFile(tempPath);

//             // Step 4: Process each worksheet
//             for (const worksheet of excelWorkbook.worksheets) {
//                 // Preserve column widths
//                 worksheet.columns.forEach(column => {
//                     column.width = column.width || 10;
//                 });

//                 // Preserve cell formats and formulas
//                 worksheet.eachRow((row, rowNumber) => {
//                     row.eachCell((cell) => {
//                         if (cell.formula) {
//                             cell.value = { formula: cell.formula };
//                         }
//                     });
//                 });
//             }

//             // Step 5: Save final version
//             excelWorkbook.xlsx.writeFile(newPath);
            
//             // Clean up temp file
//             fs.unlinkSync(tempPath);

//             this.stats.successful++;
//             this.stats.processedFiles.success.push(filename);
//             console.log(`✓ Converted: ${filename}`);
//             return true;

//         } catch (error) {
//             this.stats.failed++;
//             this.stats.processedFiles.failed.push({
//                 file: filename,
//                 error: error.message
//             });
//             console.error(`✗ Failed to convert ${filename}: ${error.message}`);
//             return false;
//         }
//     },

//     selectiveConfigCopy(sourceWorkbook, targetWorkbook, options = {}) {
//         const defaultOptions = {
//             workbook: {
//                 properties: true,
//                 protection: true,
//                 calcProperties: true,
//                 customProperties: true,
//                 definedNames: true
//             },
//             worksheet: {
//                 properties: true,
//                 pageSetup: true,
//                 views: true,
//                 columns: true,
//                 rows: true,
//                 protection: true,
//                 autoFilter: true,
//                 conditionalFormatting: true
//             },
//             cell: {
//                 values: true,
//                 formulas: true,
//                 styles: true,
//                 validation: true,
//                 hyperlinks: true,
//                 merges: true
//             }
//         };

//         // Merge user options with defaults
//         const configOptions = {
//             workbook: { ...defaultOptions.workbook, ...options.workbook },
//             worksheet: { ...defaultOptions.worksheet, ...options.worksheet },
//             cell: { ...defaultOptions.cell, ...options.cell }
//         };

//         try {
//             // Workbook Level Copying
//             if (configOptions.workbook.properties) {
//                 console.log('Copying workbook properties...');
//                 targetWorkbook.properties = {
//                     ...targetWorkbook.properties,
//                     ...sourceWorkbook.properties
//                 };
//             }

//             // Process each worksheet
//             for (const sourceSheet of sourceWorkbook.worksheets) {
//                 console.log(`Processing worksheet: ${sourceSheet.name}`);
//                 const targetSheet = targetWorkbook.addWorksheet(sourceSheet.name);

//                 // Worksheet Level Copying
//                 if (configOptions.worksheet.properties) {
//                     console.log('- Copying worksheet properties');
//                     targetSheet.properties = {
//                         ...targetSheet.properties,
//                         ...sourceSheet.properties
//                     };
//                 }

//                 if (configOptions.worksheet.pageSetup) {
//                     console.log('- Copying page setup');
//                     targetSheet.pageSetup = sourceSheet.pageSetup;
//                 }

//                 if (configOptions.worksheet.views) {
//                     console.log('- Copying sheet views');
//                     targetSheet.views = sourceSheet.views;
//                 }

//                 // Column Level Copying
//                 if (configOptions.worksheet.columns) {
//                     console.log('- Copying column configurations');
//                     sourceSheet.columns.forEach((col, index) => {
//                         if (col.width) {
//                             targetSheet.getColumn(index + 1).width = col.width;
//                         }
//                         if (col.hidden) {
//                             targetSheet.getColumn(index + 1).hidden = col.hidden;
//                         }
//                     });
//                 }

//                 // Row Level Copying
//                 if (configOptions.worksheet.rows) {
//                     console.log('- Copying row configurations');
//                     sourceSheet.eachRow((row, rowNumber) => {
//                         const targetRow = targetSheet.getRow(rowNumber);
//                         targetRow.height = row.height;
//                         targetRow.hidden = row.hidden;
//                     });
//                 }

//                 // Cell Level Copying
//                 sourceSheet.eachRow((row, rowNumber) => {
//                     row.eachCell((cell, colNumber) => {
//                         const targetCell = targetSheet.getCell(rowNumber, colNumber);

//                         if (configOptions.cell.values) {
//                             targetCell.value = cell.value;
//                         }

//                         if (configOptions.cell.formulas && cell.formula) {
//                             try {
//                                 targetCell.value = { formula: cell.formula };
//                             } catch (e) {
//                                 console.warn(`Warning: Could not copy formula in cell ${rowNumber},${colNumber}`);
//                             }
//                         }

//                         if (configOptions.cell.styles) {
//                             try {
//                                 targetCell.style = cell.style;
//                             } catch (e) {
//                                 console.warn(`Warning: Could not copy style in cell ${rowNumber},${colNumber}`);
//                             }
//                         }

//                         if (configOptions.cell.validation && cell.dataValidation) {
//                             try {
//                                 targetCell.dataValidation = cell.dataValidation;
//                             } catch (e) {
//                                 console.warn(`Warning: Could not copy validation in cell ${rowNumber},${colNumber}`);
//                             }
//                         }
//                     });
//                 });

//                 // Merge Cells
//                 if (configOptions.cell.merges) {
//                     console.log('- Copying merged cells');
//                     sourceSheet.mergeCells.forEach(mergeCell => {
//                         try {
//                             targetSheet.mergeCells(mergeCell);
//                         } catch (e) {
//                             console.warn(`Warning: Could not merge cells ${mergeCell}`);
//                         }
//                     });
//                 }
//             }

//             console.log('Selective configuration copy completed successfully');
//             return true;
//         } catch (error) {
//             console.error('Error during selective configuration copy:', error.message);
//             return false;
//         }
//     },

//     process() {
//         try {
//             this.init();
//             const files = this.getAllExcelFiles();
//             this.stats.totalFiles = files.length;
//             console.log(`Found ${files.length} Excel files to process\n`);

//             for (const file of files) {
//                 const ext = path.extname(file).toLowerCase();
//                 if (ext === '.xls') {
//                     this.processXlsFile(file);
//                 } else {
//                     this.processFile(file); // For .xlsx files
//                 }
//             }

//             this.generateReport();
//         } catch (error) {
//             console.error('Process failed:', error.message);
//         }
//     },

//     async copyStylesBetweenFiles(sourcePath, targetPath) {
//         try {
//             console.log('\n=== Starting Custom Style Transfer Process ===');
            
//             // Validate inputs
//             await this.validateExcelFiles(sourcePath, targetPath);
            
//             // Process source file if needed
//             const processedSourcePath = await this.preprocessSourceFile(sourcePath);
            
//             // Load workbooks
//             const [sourceWorkbook, targetWorkbook] = await Promise.all([
//                 this.loadWorkbook(processedSourcePath),
//                 this.loadWorkbook(targetPath)
//             ]);
            
//             // Copy workbook properties
//             this.copyWorkbookProperties(sourceWorkbook, targetWorkbook);
            
//             // Process worksheets
//             await this.processWorksheets(sourceWorkbook, targetWorkbook);
            
//             // Save and cleanup
//             await targetWorkbook.xlsx.writeFile(targetPath);
//             if (processedSourcePath !== sourcePath) {
//                 fs.unlinkSync(processedSourcePath);
//             }

//             console.log('\n✓ Style transfer completed successfully');
//             return { success: true, message: 'Style transfer completed successfully', sourcePath, targetPath };

//         } catch (error) {
//             console.error('✗ Style transfer failed:', error.message);
//             return { success: false, error: error.message, sourcePath, targetPath };
//         }
//     },

//     // Helper methods
//     async validateExcelFiles(sourcePath, targetPath) {
//         for (const path of [sourcePath, targetPath]) {
//             if (!fs.existsSync(path)) {
//                 throw new Error(`File does not exist: ${path}`);
//             }
//             const ext = path.extname(path).toLowerCase();
//             if (!['.xls', '.xlsx'].includes(ext)) {
//                 throw new Error(`File must be an Excel file (.xls or .xlsx): ${path}`);
//             }
//         }
//     },

//     async preprocessSourceFile(sourcePath) {
//         const sourceExt = path.extname(sourcePath).toLowerCase();
//         if (sourceExt === '.xls') {
//             console.log('Converting source .xls file...');
//             const tempPath = path.join(this.convertedPath, `temp_${Date.now()}.xlsx`);
//             await this.processXlsFile(sourcePath, tempPath);
//             return tempPath;
//         }
//         return sourcePath;
//     },

//     async loadWorkbook(filepath) {
//         const workbook = new ExcelJS.Workbook();
//         return workbook.xlsx.readFile(filepath);
//     },

//     getWorksheetList(workbook, sheetName = null) {
//         if (sheetName) {
//             const worksheet = workbook.getWorksheet(sheetName);
//             if (!worksheet) {
//                 const availableSheets = workbook.worksheets.map(sheet => sheet.name);
//                 throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${availableSheets.join(', ')}`);
//             }
//             return [worksheet];
//         }
//         return workbook.worksheets;
//     },

//     async processWorksheetUnmerge(worksheet) {
//         // Get merged cells using _merges property
//         const mergedCells = worksheet._merges ? Array.from(worksheet._merges) : [];
        
//         if (mergedCells.length === 0) {
//             console.log(`No merged cells found in worksheet: ${worksheet.name}`);
//             return;
//         }
        
//         console.log(`Processing worksheet: ${worksheet.name}`);
//         for (const mergedRange of mergedCells) {
//             try {
//                 await this.unmergeRange(worksheet, mergedRange);
//             } catch (error) {
//                 console.warn(`Warning: Could not process merged range ${mergedRange}: ${error.message}`);
//             }
//         }
//         console.log(`✓ Unmerged ${mergedCells.length} cell ranges in worksheet: ${worksheet.name}`);
//     },

//     async unmergeRange(worksheet, mergedRange) {
//         const [startCell] = worksheet.getMergeCells(mergedRange);
//         const value = worksheet.getCell(startCell).value;
        
//         worksheet.unMergeCells(mergedRange);
        
//         const [start, end] = mergedRange.split(':');
//         const startAddress = worksheet.getCell(start);
//         const endAddress = worksheet.getCell(end);
        
//         for (let row = startAddress.row; row <= endAddress.row; row++) {
//             for (let col = startAddress.col; col <= endAddress.col; col++) {
//                 worksheet.getCell(row, col).value = value;
//             }
//         }
//     }
// };

// const Column = {
//     workbook: new ExcelJS.Workbook(),
    
//     
// sheets.js
module.exports = {
    getBlankRowsColumns: function(filepath, sheetName, workbook) {
        // your function implementation
    },
    removeSheetBorder: function(filepath, sheetName) {
        
    }
};
