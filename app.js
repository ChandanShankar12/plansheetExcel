const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const sheets = require('./sheets.js');


module.exports = {

    

    createUnmergedExcel: async function(filepath, sheetName) {
        try {
            // Check if file exists first
            if (!fs.existsSync(filepath)) {
                throw new Error(`File not found: ${filepath}`);
            }

            // Read the existing file first
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filepath);
            
            // Get the worksheet
            const worksheet = workbook.getWorksheet(sheetName);
            
            if (!worksheet) {
                throw new Error(`Sheet "${sheetName}" not found`);
            }

            // Remove all merged cells by getting merged cell ranges first
            worksheet.unMergeCells('A1:M700');
            
            sheets.removeSheetBorder(filepath, sheetName);

            // Sheets.getBlankRowsColumns(filepath, sheetName, workbook);
            // Write back to file
            await workbook.xlsx.writeFile(filepath);
            console.log("File processed successfully");
            return true;
        } catch (error) {
            console.error('Error processing Excel file:', error);
            return false;
        }

    },

    getColumnData: async function(filePath, columnRange, sheetName = null, rowRange = null) {
        try {
            // Create workbook and load the file
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            // Get and log the folder name
            const folderName = path.dirname(filePath);
            console.log('Folder name:', folderName);

            // List available sheets
            const availableSheets = workbook.worksheets.map(sheet => sheet.name);
            console.log('Available sheets:', availableSheets);

            // Get the worksheet (active sheet if sheetName not provided)
            let worksheet;
            if (sheetName) {
                worksheet = workbook.getWorksheet(sheetName);
                if (!worksheet) {
                    throw new Error(`Sheet "${sheetName}" not found in workbook. Available sheets: ${availableSheets.join(', ')}`);
                }
            } else {
                worksheet = workbook.worksheets[0];
            }

            // Function to convert column letter to number (e.g., 'A' -> 1, 'B' -> 2)
            const columnLetterToNumber = (letter) => {
                let number = 0;
                for (let i = 0; i < letter.length; i++) {
                    number = number * 26 + letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
                }
                return number;
            };

            // Function to get column data with optional range filtering
            const getColumnsData = (columnRange, rowRange) => {
                const columnsData = {};
                
                // Parse column range (e.g., "A:C" or "A")
                let startCol, endCol;
                if (columnRange.includes(':')) {
                    [startCol, endCol] = columnRange.split(':').map(col => columnLetterToNumber(col));
                } else {
                    startCol = endCol = columnLetterToNumber(columnRange);
                }

                // Parse row range
                let startRow = 1;
                let endRow = worksheet.rowCount;
                if (rowRange) {
                    [startRow, endRow] = rowRange.split('-').map(num => parseInt(num));
                }

                // Iterate through each column in the range
                for (let colNum = startCol; colNum <= endCol; colNum++) {
                    const colLetter = worksheet.getColumn(colNum).letter;
                    columnsData[colLetter] = {};

                    // Iterate through each row in the range
                    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
                        const cell = worksheet.getCell(`${colLetter}${rowNum}`);
                        if (cell.value !== null && cell.value !== undefined) {
                            columnsData[colLetter][`${colLetter}${rowNum}`] = {
                                value: cell.value,
                            };
                        }
                    }
                }

                // Create Data directory in __tests__ folder if it doesn't exist
                const outputDir = path.join(__dirname, '/__test__/Processed_Files_Data');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                // Save data to JSON file
                const outputData = {
                    columnsData: columnsData,
                    rowRange: rowRange ? { start: startRow, end: endRow } : null,
                    columnRange: { start: startCol, end: endCol }
                };

                const outputPath = path.join(outputDir, `columns_data_${columnRange.replace(':', '-')}.json`);
                fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
                console.log(`Data saved to: ${outputPath}`);

                return outputData;
            };

            const result = getColumnsData(columnRange, rowRange);
            console.log('Complete Columns Data:', result);

            return result;

        } catch (error) {
            console.error('Error in getColumnData:', error.message);
            throw error;
        }
    },

    processColumnData: function(columnNames, inputFilePath, outputFilePath) {
        try {
            // Validate inputs
            if (!Array.isArray(columnNames)) {
                throw new Error('columnNames must be an array');
            }

            // Check if input file exists
            if (!fs.existsSync(inputFilePath)) {
                throw new Error(`Input file not found: ${inputFilePath}`);
            }

            // Read the input JSON file
            const rawData = fs.readFileSync(inputFilePath);
            let columnData;
            try {
                columnData = JSON.parse(rawData);
            } catch (e) {
                throw new Error('Invalid JSON in input file');
            }

            // Initialize result object to store processed data
            const processedData = {};

            // Process each requested column
            for (const columnName of columnNames) {
                // Initialize empty array for this column
                processedData[columnName] = [];

                // Get column data if it exists
                if (columnData.columnsData && columnData.columnsData[columnName]) {
                    const column = columnData.columnsData[columnName];
                    // Extract all values from the column and remove first 2 values
                    const values = Object.values(column)
                        .map(cell => cell.value)
                        .filter(value => {
                            // Handle rich text objects
                            if (value && typeof value === 'object' && value.richText) {
                                return value.richText.map(item => item.text).join('');
                            }
                            // Handle regular values
                            return value != null;
                        })
                        .map(value => {
                            // Convert rich text objects to plain text
                            if (value && typeof value === 'object' && value.entry) {
                    return value.entry;
                }
                            return value;
                        })
                        .filter(value => value != null) // Filter out null/undefined values
                        .slice(2); // Remove first 2 values
                
                    // Remove duplicates and store in result
                    processedData[columnName] = [...new Set(values)];
                } else {
                    console.warn(`Column ${columnName} not found in input data`);
                }
            }

            // Create output directory if it doesn't exist
            const outputDir = path.dirname(outputFilePath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Save processed data to JSON file
            fs.writeFileSync(outputFilePath, JSON.stringify(processedData, null, 2));
            console.log(`Processed data saved to: ${outputFilePath}`);

           
            return processedData;

        } catch (error) {
            console.error('Error in processColumnData:', error);
            throw error;
        }
    },

    removeRichTextAndEntry: async function(filePath) {
        try {
            // Read the JSON file
            const rawData = fs.readFileSync(filePath);
            let jsonData = JSON.parse(rawData);

            // Function to clean individual value
            const cleanValue = (value) => {
                // If value is an object with richText property
                if (value && typeof value === 'object' && value.richText) {
                    return value.richText.map(item => item.text).join('');
                }
                // If value is an object with entry property
                if (value && typeof value === 'object' && value.entry) {
                    return value.entry;
                }
                // Return the value as is if it's not an object or doesn't have these properties
                return value;
            };

            // Process the data structure
            const cleanData = {};
            
            // If the data has columnsData structure
            if (jsonData.columnsData) {
                cleanData.columnsData = {};
                
                // Process each column
                for (const [colKey, colData] of Object.entries(jsonData.columnsData)) {
                    cleanData.columnsData[colKey] = {};
                    
                    // Process each cell in the column
                    for (const [cellKey, cellData] of Object.entries(colData)) {
                        cleanData.columnsData[colKey][cellKey] = {
                            value: cleanValue(cellData.value),
                            type: cellData.type
                        };
                    }
                }
                // Process each column in the data
                Object.keys(jsonData).forEach(column => {
                    if (Array.isArray(jsonData[column])) {
                        cleanData[column] = jsonData[column].map(item => {
                            // If item is an object with result property, return just the result
                            if (item && typeof item === 'object' && 'result' in item) {
                                return item.result;
                            }
                            // Otherwise return the item as is (for direct values)
                            return item;
                        });
                    }
                });
                // Preserve other properties if they exist
                if (jsonData.rowRange) cleanData.rowRange = jsonData.rowRange;
                if (jsonData.columnRange) cleanData.columnRange = jsonData.columnRange;
            } else {
                // If it's a simpler structure, process directly
                for (const [key, values] of Object.entries(jsonData)) {
                    cleanData[key] = Array.isArray(values) 
                        ? values.map(cleanValue)
                        : cleanValue(values);
                }
            }
            
            // Write back to the same file
            fs.writeFileSync(filePath, JSON.stringify(cleanData, null, 2));
            console.log(`File cleaned and saved: ${filePath}`);
            
            return cleanData;
        } catch (error) {
            console.error('Error in removeRichTextAndEntry:', error);
            throw error;
        }
    },

    transformColumnH: function(inputFilePath) {
        return new Promise((resolve, reject) => {
            // Read the file
            fs.readFile(inputFilePath, 'utf8', (err, data) => {
                if (err) {
                    reject(`Error reading file: ${err}`);
                    return;
                }
    
                try {
                    // Parse JSON data
                    let jsonData = JSON.parse(data);
    
                    // Transform column H
                    jsonData.H = jsonData.H.map(item => {
                        return typeof item === 'object' && item !== null ? item.result : item;
                    });
    
                    // Write the transformed data back to file
                    fs.writeFile(inputFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                        if (err) {
                            reject(`Error writing file: ${err}`);
                            return;
                        }
                        resolve('File has been successfully updated');
                    });
    
                } catch (error) {
                    reject(`Error processing JSON: ${error}`);
                }
            });
        });
    }
};


        



