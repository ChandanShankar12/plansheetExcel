const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');

class ExcelProcessor {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.convertedPath = path.join(rootPath, 'convertedFiles');
        this.stats = {
            totalFiles: 0,
            successful: 0,
            failed: 0,
            processedFiles: {
                success: [],
                failed: []
            }
        };
    }

    // Initialize and validate directories
    async init() {
        try {
            if (!fs.existsSync(this.rootPath)) {
                throw new Error(`Root directory ${this.rootPath} does not exist`);
            }

            // Clean or create convertedFiles directory
            if (fs.existsSync(this.convertedPath)) {
                console.log('Cleaning existing converted files directory...');
                fs.rmSync(this.convertedPath, { recursive: true });
            }
            fs.mkdirSync(this.convertedPath);
            console.log('✓ Initialized converted files directory');
            return true;
        } catch (error) {
            console.error('✗ Initialization failed:', error.message);
            return false;
        }
    }

    // Check if file is Excel format
    isExcelFile(filename) {
        const ext = path.extname(filename).toLowerCase();
        return ext === '.xls' || ext === '.xlsx';
    }

    // Get all Excel files recursively
    getAllExcelFiles(dirPath = this.rootPath) {
        let files = [];
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            if (fs.statSync(fullPath).isDirectory() && 
                !fullPath.includes('convertedFiles')) {
                files = files.concat(this.getAllExcelFiles(fullPath));
            } else if (this.isExcelFile(item)) {
                files.push(fullPath);
            }
        }
        return files;
    }

    // Process single Excel file
    async processFile(filePath) {
        const filename = path.basename(filePath);
        const newPath = path.join(this.convertedPath, `${path.parse(filename).name}.xlsx`);

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            await workbook.xlsx.writeFile(newPath);
            
            this.stats.successful++;
            this.stats.processedFiles.success.push(filename);
            console.log(`✓ Converted: ${filename}`);
            return true;
        } catch (error) {
            this.stats.failed++;
            this.stats.processedFiles.failed.push({
                file: filename,
                error: error.message
            });
            console.error(`✗ Failed to convert ${filename}: ${error.message}`);
            return false;
        }
    }

    // Generate processing report
    generateReport() {
        console.log('\n=== Excel Processing Report ===');
        console.log(`Total files processed: ${this.stats.totalFiles}`);
        console.log(`Successful conversions: ${this.stats.successful}`);
        console.log(`Failed conversions: ${this.stats.failed}`);
        
        if (this.stats.failed > 0) {
            console.log('\nFailed Files:');
            this.stats.processedFiles.failed.forEach(failure => {
                console.log(`- ${failure.file}: ${failure.error}`);
            });
        }
    }

    // Process XLS file
    async processXlsFile(filePath) {
        const filename = path.basename(filePath);
        const newPath = path.join(this.convertedPath, `${path.parse(filename).name}.xlsx`);

        try {
            // Step 1: Read XLS file using XLSX (better for old Excel formats)
            const workbook = XLSX.readFile(filePath, {
                cellStyles: true,
                cellNF: true,
                cellFormula: true
            });

            // Step 2: Convert to XLSX format
            const tempPath = path.join(this.convertedPath, 'temp.xlsx');
            XLSX.writeFile(workbook, tempPath);

            // Step 3: Use ExcelJS to preserve additional formatting
            const excelWorkbook = new ExcelJS.Workbook();
            await excelWorkbook.xlsx.readFile(tempPath);

            // Step 4: Process each worksheet
            for (const worksheet of excelWorkbook.worksheets) {
                // Preserve column widths
                worksheet.columns.forEach(column => {
                    column.width = column.width || 10;
                });

                // Preserve cell formats and formulas
                worksheet.eachRow((row, rowNumber) => {
                    row.eachCell((cell) => {
                        if (cell.formula) {
                            cell.value = { formula: cell.formula };
                        }
                    });
                });
            }

            // Step 5: Save final version
            await excelWorkbook.xlsx.writeFile(newPath);
            
            // Clean up temp file
            fs.unlinkSync(tempPath);

            this.stats.successful++;
            this.stats.processedFiles.success.push(filename);
            console.log(`✓ Converted: ${filename}`);
            return true;

        } catch (error) {
            this.stats.failed++;
            this.stats.processedFiles.failed.push({
                file: filename,
                error: error.message
            });
            console.error(`✗ Failed to convert ${filename}: ${error.message}`);
            return false;
        }
    }

    async selectiveConfigCopy(sourceWorkbook, targetWorkbook, options = {}) {
        const defaultOptions = {
            workbook: {
                properties: true,
                protection: true,
                calcProperties: true,
                customProperties: true,
                definedNames: true
            },
            worksheet: {
                properties: true,
                pageSetup: true,
                views: true,
                columns: true,
                rows: true,
                protection: true,
                autoFilter: true,
                conditionalFormatting: true
            },
            cell: {
                values: true,
                formulas: true,
                styles: true,
                validation: true,
                hyperlinks: true,
                merges: true
            }
        };

        // Merge user options with defaults
        const configOptions = {
            workbook: { ...defaultOptions.workbook, ...options.workbook },
            worksheet: { ...defaultOptions.worksheet, ...options.worksheet },
            cell: { ...defaultOptions.cell, ...options.cell }
        };

        try {
            // Workbook Level Copying
            if (configOptions.workbook.properties) {
                console.log('Copying workbook properties...');
                targetWorkbook.properties = {
                    ...targetWorkbook.properties,
                    ...sourceWorkbook.properties
                };
            }

            // Process each worksheet
            for (const sourceSheet of sourceWorkbook.worksheets) {
                console.log(`Processing worksheet: ${sourceSheet.name}`);
                const targetSheet = targetWorkbook.addWorksheet(sourceSheet.name);

                // Worksheet Level Copying
                if (configOptions.worksheet.properties) {
                    console.log('- Copying worksheet properties');
                    targetSheet.properties = {
                        ...targetSheet.properties,
                        ...sourceSheet.properties
                    };
                }

                if (configOptions.worksheet.pageSetup) {
                    console.log('- Copying page setup');
                    targetSheet.pageSetup = sourceSheet.pageSetup;
                }

                if (configOptions.worksheet.views) {
                    console.log('- Copying sheet views');
                    targetSheet.views = sourceSheet.views;
                }

                // Column Level Copying
                if (configOptions.worksheet.columns) {
                    console.log('- Copying column configurations');
                    sourceSheet.columns.forEach((col, index) => {
                        if (col.width) {
                            targetSheet.getColumn(index + 1).width = col.width;
                        }
                        if (col.hidden) {
                            targetSheet.getColumn(index + 1).hidden = col.hidden;
                        }
                    });
                }

                // Row Level Copying
                if (configOptions.worksheet.rows) {
                    console.log('- Copying row configurations');
                    sourceSheet.eachRow((row, rowNumber) => {
                        const targetRow = targetSheet.getRow(rowNumber);
                        targetRow.height = row.height;
                        targetRow.hidden = row.hidden;
                    });
                }

                // Cell Level Copying
                sourceSheet.eachRow((row, rowNumber) => {
                    row.eachCell((cell, colNumber) => {
                        const targetCell = targetSheet.getCell(rowNumber, colNumber);

                        if (configOptions.cell.values) {
                            targetCell.value = cell.value;
                        }

                        if (configOptions.cell.formulas && cell.formula) {
                            try {
                                targetCell.value = { formula: cell.formula };
                            } catch (e) {
                                console.warn(`Warning: Could not copy formula in cell ${rowNumber},${colNumber}`);
                            }
                        }

                        if (configOptions.cell.styles) {
                            try {
                                targetCell.style = cell.style;
                            } catch (e) {
                                console.warn(`Warning: Could not copy style in cell ${rowNumber},${colNumber}`);
                            }
                        }

                        if (configOptions.cell.validation && cell.dataValidation) {
                            try {
                                targetCell.dataValidation = cell.dataValidation;
                            } catch (e) {
                                console.warn(`Warning: Could not copy validation in cell ${rowNumber},${colNumber}`);
                            }
                        }
                    });
                });

                // Merge Cells
                if (configOptions.cell.merges) {
                    console.log('- Copying merged cells');
                    sourceSheet.mergeCells.forEach(mergeCell => {
                        try {
                            targetSheet.mergeCells(mergeCell);
                        } catch (e) {
                            console.warn(`Warning: Could not merge cells ${mergeCell}`);
                        }
                    });
                }
            }

            console.log('Selective configuration copy completed successfully');
            return true;
        } catch (error) {
            console.error('Error during selective configuration copy:', error.message);
            return false;
        }
    }

    // Main process
    async process() {
        try {
            await this.init();
            const files = this.getAllExcelFiles();
            this.stats.totalFiles = files.length;
            console.log(`Found ${files.length} Excel files to process\n`);

            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (ext === '.xls') {
                    await this.processXlsFile(file);
                } else {
                    await this.processFile(file); // For .xlsx files
                }
            }

            this.generateReport();
        } catch (error) {
            console.error('Process failed:', error.message);
        }
    }
}

// Usage
async function main() {
    const rootDirectory = path.join(__dirname, './Production Files');
    const processor = new ExcelProcessor(rootDirectory);
    await processor.process();
}

// Run the process
main().catch(console.error);

// Add this at the end of the file, before the main() function
module.exports = ExcelProcessor;

// Comment out or remove the automatic execution
// main().catch(console.error);