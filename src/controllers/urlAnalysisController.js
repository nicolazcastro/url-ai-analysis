const { analyze } = require('../services/urlAnalysisService');
const fs = require('fs').promises;
let analysisCompleted = false; 

const analyzeUrl = async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'Missing URL in request body' });
    }
    try {
        await analyze(url);
        analysisCompleted = true;       
        res.json({ message: 'Analysis finished' });
    } catch (error) {
        console.error('Error processing URL:', error);
        res.status(500).json({ message: error.message });
    }
};

const getResult = async (req, res) => {
    const { url } = req.query;
    const outputDirectory = process.env.OUTPUT_FOLDER;
    const resultFilePath = `${outputDirectory}/${encodeURIComponent(url)}-ai-result.json`;

    if (!analysisCompleted) {
        const logFilePath = `${outputDirectory}/log.txt`;
        try {
            const logData = await fs.readFile(logFilePath, 'utf8');
            const logs = logData.trim().split('\n');
            const lastLog = logs[logs.length - 1];
            res.json({ message: lastLog, completed: false, analysisCompleted: analysisCompleted });
        } catch (err) {
            console.log('Error reading log file:', err);
            res.json({ message: 'Nothing to display yet. Processing...', completed: false, analysisCompleted: analysisCompleted });
        }
    } else {
        try {
            const jsonString = await fs.readFile(resultFilePath, 'utf8');
            const result = JSON.parse(jsonString);
            const content = result.choices[0].message.content; // Get the "content" node
            res.send(`<div>${content}</div>`); // Display the content in a div
        } catch (err) {
            console.log('Error reading file:', err);
            res.json({ message: 'Analysis completed but no result file available yet. Processing...', completed: false, analysisCompleted: analysisCompleted });
        }
    }
};

module.exports = { analyzeUrl, getResult };
