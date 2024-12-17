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

    },
    createPairedRowData: async function(filePath, outputPath) {
        try {
            // Create workbook and load the file
            const workbook = new ExcelJS.Workbook();
            // Make this async operation properly awaited
            return workbook.xlsx.readFile(filePath).then(() => {
                // Get the first worksheet if 'MainSheet' doesn't exist
                const worksheet = workbook.getWorksheet('MainSheet') || workbook.worksheets[0];
                
                // Add error checking
                if (!worksheet) {
                    throw new Error('No worksheet found in the workbook');
                }

                const rowData = {};
                let rowCount = 0;

                // Iterate through rows
                worksheet.eachRow((row, rowNumber) => {
                    // Get cell values, skipping first empty element
                    const rowValues = row.values.slice(1).map(cell => {
                        if (cell && typeof cell === 'object') {
                            // Handle richText objects
                            if (cell.richText) {
                                return cell.richText.map(rt => rt.text).join('');
                            }
                            // Handle other cell result values
                            if (cell.result !== undefined) {
                                return cell.result;
                            }
                        }
                        return cell;
                    });

                    rowData[rowCount] = rowValues;
                    rowCount++;
                });

                const outputDir = path.join(__dirname, './__test__/Processed_Files_Data');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                // Write to JSON file
                fs.writeFileSync(outputPath, JSON.stringify(rowData, null, 2));
                
                console.log(`Row data saved to: ${outputPath}`);
                return rowData;
            });

        } catch (error) {
            console.error('Error creating row data:', error);
            throw error;
        }
    },

    cleanJsonData: function(filepath) {
        try {
            // Read the file
            const jsonData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            
            // Clean the data
            const cleanedData = jsonData.map(row => {
                return row.map(subRow => {
                    return subRow.map(cell => {
                        // If cell is an object with richText, get the combined text
                        if (cell && typeof cell === 'object' && cell.richText) {
                            return cell.richText.map(part => part.text).join('');
                        }
                        // If cell is an object with result, return only the result
                        if (cell && typeof cell === 'object' && 'result' in cell) {
                            return cell.result;
                        }
                        // Otherwise return the cell value as is
                        return cell;
                    });
                });
            });
    
            // Write back to the same file
            fs.writeFileSync(filepath, JSON.stringify(cleanedData, null, 2));
            console.log('Successfully cleaned and saved JSON data');
            
        } catch (error) {
            console.error('Error processing JSON file:', error);
        }
    },

    individualboothdetails: function(filepath) {
        try {
            const jsonData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            const boothDetails = {};
            
            jsonData.forEach(row => {
                if (!Array.isArray(row) || row.length < 2) return;
                
                const [firstSubRow, secondSubRow] = row;
                
                if (!Array.isArray(firstSubRow) || !firstSubRow[2] || 
                    !Array.isArray(secondSubRow) || !secondSubRow[2]) return;

                const boothNo = firstSubRow[2]; // Assuming booth number is at index 2
                
                // Skip if boothNo is not an integer
                if (!Number.isInteger(boothNo)) return;

                // Create structured object
                boothDetails[boothNo] = {
                    "SNo.": firstSubRow[0],
                    "CHC": firstSubRow[1],
                    "Booth No.": boothNo,
                    "Booth Location": firstSubRow[3] || null,
                    "Population": firstSubRow[4] || null,
                    "Targeted Population": firstSubRow[5] || null,
                    "No. of Houses": firstSubRow[6] || null,
                    "Almendazol Req.": firstSubRow[7] || null,
                    "Dec Req.": firstSubRow[8] || null,
                    "Post Name": {
                        "AWW": {
                            "name": firstSubRow[9] || null,
                            "Phone No.": firstSubRow[11] ? String(firstSubRow[11]) : "null"
                        },
                        "xzkeh.k": {
                            "name": secondSubRow[9] || null,
                            "Phone No.": secondSubRow[11] ? String(secondSubRow[11]) : "null"
                        }
                    },
                    "Date of Medicine Feeling": firstSubRow[12] || null,
                    "Supervisor name": firstSubRow[13] || null
                };
            });
            
            const outputDir = path.join(__dirname, './__test__/Processed_Files_Data');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            const outputPath = path.join(outputDir, 'booth_details.json');
            fs.writeFileSync(outputPath, JSON.stringify(boothDetails, null, 2));
            
            console.log(`Booth details saved to: ${outputPath}`);
            return boothDetails;

        } catch (error) {
            console.error('Error processing JSON file:', error);
            throw error;
        }
    },

    mapBoothDetailsToExcel: async function(inputFilePath, outputDirPath) {
        try {
            // Read booth details JSON
            const boothDetailsRaw = fs.readFileSync(inputFilePath, 'utf8');
            const boothDetails = JSON.parse(boothDetailsRaw);

            // Load Excel template
            const workbook = new ExcelJS.Workbook();
            
            // Process each booth
            for (const [boothNo, details] of Object.entries(boothDetails)) {
                // Create a new workbook for each booth
                const templatePath = path.join(__dirname, './__test__/ProcessFiles/303 MDA Mircorplan.xlsx');
                await workbook.xlsx.readFile(templatePath);
                const worksheet = workbook.getWorksheet(1);

                // Update B4 cell - Booth Number
                const cellB4 = worksheet.getCell('B4');
                const currentB4Value = cellB4.value;
                // Keep text before % and append booth number
                cellB4.value = currentB4Value.toString().split('%')[0] + '%' + details['Booth No.'];

                // Update D4 cell - First Worker Details (AWW)
                const cellD4 = worksheet.getCell('D4');
                const awwDetails = details['Post Name']['AWW'];
                // Format: izFke nydehZ dk uke %[name] inuke%AWW Qksu ua0%[phone]
                cellD4.value = `izFke nydehZ dk uke %${awwDetails.name} inuke%AWW Qksu ua0%${awwDetails['Phone No.']}`;

                // Update D5 cell - Second Worker Details (xzkeh.k)
                const cellD5 = worksheet.getCell('D5');
                const xzkehDetails = details['Post Name']['xzkeh.k'];
                // Format: f}rh; nydehZ dk uke %[name] inuke%xzkeh.k Qksu ua0%[phone]
                cellD5.value = `f}rh; nydehZ dk uke %${xzkehDetails.name} inuke%xzkeh.k Qksu ua0%${xzkehDetails['Phone No.']}`;

                // Distribute houses across cells
                const totalHouses = details['No. of Houses'];
                const numCells = 14; // Total cells to distribute across
                const housesPerCell = Math.floor(totalHouses / numCells);
                const remainder = totalHouses % numCells;

                // Define all house cells
                const houseCells = [
                    'B10', 'D10', 'F10', 'H10', 'J10', 'L10', 'N10',
                    'B17', 'D17', 'F17', 'H17', 'J17', 'L17', 'N17'
                ];

                // Distribute houses evenly with remainder
                houseCells.forEach((cell, index) => {
                    const value = housesPerCell + (index < remainder ? 1 : 0);
                    worksheet.getCell(cell).value = value;
                });

                // Create output directory if needed
                if (!fs.existsSync(outputDirPath)) {
                    fs.mkdirSync(outputDirPath, { recursive: true });
                }

                // Save as new file with booth number
                const outputPath = path.join(outputDirPath, `${boothNo} MDA 2025.xlsx`);
                await workbook.xlsx.writeFile(outputPath);
            }

            console.log('Successfully generated Excel files for all booths');

        } catch (error) {
            console.error('Error mapping booth details to Excel:', error);
            throw error;
        }
    }
}