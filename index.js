const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const dotenv = require('dotenv');
const { processUrlData } = require('./src/utils/aiAnalyzer');

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory


app.post('/analyze', async (req, res) => {
    const data = req.body;
    await processUrlData(data); // Generate the JSON file with analysis result
    res.json({ message: 'Analysis started' });
});

app.get('/result', (req, res) => {
    const url = req.query.url;
    const outputDirectory = process.env.OUTPUT_FOLDER;
    const resultFilePath = `${outputDirectory}/${encodeURIComponent(url)}-ai-result.json`;

    fs.readFile(resultFilePath, 'utf8', (err, jsonString) => {
        if (err) {
            console.log('Error reading file:', err);
            return res.status(500).json({ error: 'Error reading file' });
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
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
