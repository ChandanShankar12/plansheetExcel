const express = require('express');
const path = require('path');
const app = express();
const ExcelProcessor = require('./exceltest');

// Serve static files from the root directory
app.use(express.static(__dirname));

// Add middleware to parse JSON
app.use(express.json());

// API endpoint to process Excel files
app.post('/process-excel', async (req, res) => {
    try {
        const { folderPath } = req.body;
        
        // Validate folder path
        if (!folderPath) {
            throw new Error('Folder path is required');
        }

        // Use the provided folder path or fall back to default
        const rootDirectory = folderPath || path.join(__dirname, './Production Files');
        const processor = new ExcelProcessor(rootDirectory);
        await processor.process();

        res.json({
            success: true,
            message: 'Excel processing completed',
            stats: processor.stats,
            convertedPath: processor.convertedPath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to transfer styles between Excel files
app.post('/transfer-styles', async (req, res) => {
    try {
        const { sourcePath, targetPath } = req.body;
        
        if (!sourcePath || !targetPath) {
            throw new Error('Both source and target paths are required');
        }

        const processor = new ExcelProcessor(__dirname);
        const result = await processor.copyStylesBetweenFiles(sourcePath, targetPath);
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Basic route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});