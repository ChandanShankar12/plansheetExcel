const express = require('express');
const path = require('path');
const app = express();
const ExcelProcessor = require('./exceltest');

// Serve static files from the root directory
app.use(express.static(__dirname));

// API endpoint to process Excel files
app.post('/process-excel', async (req, res) => {
    try {
        const rootDirectory = path.join(__dirname, './Production Files');
        const processor = new ExcelProcessor(rootDirectory);
        await processor.process();
        res.json({ success: true, message: 'Excel processing completed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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