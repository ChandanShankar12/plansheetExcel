const ExcelJS = require('exceljs');
const fs = require('fs');

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

            

            // Remove any merged cells
            worksheet.unMergeCells();

            // Write back to file
            await workbook.xlsx.writeFile(filepath);
            console.log("File processed successfully");
            return true;
        } catch (error) {
            console.error('Error processing Excel file:', error);
            return false;
        }
    }
}



