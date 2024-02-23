const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const dotenv = require('dotenv');
const { analyzeUrl } = require('./src/ai-analisys');

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

let analysisCompleted = false;

// Route to handle URL analysis request
app.post('/analyze', async (req, res) => {
    analysisCompleted = false;
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'Missing URL in request body' });
    }
    try {
        await analyzeUrl(url); // Generate the JSON file with analysis result
        analysisCompleted = true;
        res.json({ message: 'Analysis finished', completed: true, analysisCompleted: analysisCompleted });
    } catch (error) {
        console.error('Error processing URL:', error);
        res.status(500).json({ message: error.message, completed: true, analysisCompleted: true });
    }
});

// Route to get the result of the URL analysis
app.get('/result', (req, res) => {
    const url = req.query.url;
    const outputDirectory = process.env.OUTPUT_FOLDER;
    const resultFilePath = `${outputDirectory}/${encodeURIComponent(url)}-ai-result.json`;

    if (!analysisCompleted) {
        const logFilePath = `${outputDirectory}/log.txt`;
        fs.readFile(logFilePath, 'utf8', (err, logData) => {
            if (err) {
                console.log('Error reading log file:', err);
                return res.json({ message: 'Nothing to display yet. Processing...', completed: false, analysisCompleted: analysisCompleted });
            }

            const logs = logData.trim().split('\n'); // Split log file content into an array of lines
            const lastLog = logs[logs.length - 1]; // Get the last line of the log
            res.json({ message: lastLog, completed: false, analysisCompleted: analysisCompleted });
        });
    } else {
        fs.readFile(resultFilePath, 'utf8', (err, jsonString) => {
            if (err) {
                console.log('Error reading file:', err);
                return res.json({ message: 'Analisys completed but no result file available yet. Processing...', completed: false, analysisCompleted: analysisCompleted });
            }

            try {
                const result = JSON.parse(jsonString);
                const content = result.choices[0].message.content; // Get the "content" node
                res.send(`<div>${content}</div>`); // Display the content in a div
            } catch (e) {
                console.log('Error parsing JSON:', e);
                return res.status(500).json({ error: 'Error parsing JSON' });
            }
        });
    }
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
