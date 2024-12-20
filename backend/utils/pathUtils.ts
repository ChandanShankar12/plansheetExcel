import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PATHS = {
    plansheet: path.join(__dirname, '../../__test__/ProcessFiles/MDA PLAN 2025.xlsx'),
    boothDetails: path.join(__dirname, '../../__test__/Processed_Files_Data/booth_details.json'),
    outputDir: path.join(__dirname, '../../__test__/Processed_Files_Data/Converted_Files')
}; 