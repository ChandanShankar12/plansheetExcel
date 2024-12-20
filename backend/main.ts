import { fileURLToPath } from 'url';
import path from 'path';
import ExcelJS from 'exceljs';
import { config } from 'dotenv';
import app from './app.js';
import { processExcelFile } from './services/excelService.js';
import { PATHS } from './utils/pathUtils.js';

config(); // Load environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

async function main() {
    try {
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Process Excel file
        await processExcelFile();
        console.log('Excel processing completed');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the main function if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export { main }; 