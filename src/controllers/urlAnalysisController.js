const { analyze, writeFinalResult, deleteCachedFileIfExists } = require('../services/urlAnalysisService');
const { analyzeUrlWithVariations } = require('../utils/urlVariations');
const { setCurrentUser } = require('../utils/fileWriter');
const userService = require('../services/userService');
const path = require('path');
const fs = require('fs').promises;
const getRedisClient = require('../utils/cache');


let analysisCompleted = false; 
let analyzedUrl = '';

const outputDirectory = process.env.OUTPUT_FOLDER || './url-output'; // Output directory

const analyzeUrl = async (req, res) => {
    const { url, userId } = req.body;

    const userCredit = await userService.getCredit(userId);

    if (userCredit <= 0) {
        return res.status(402).json({ message: 'Insufficient credit' });
    }
    
    if (!url) {
        return res.status(400).json({ message: 'Missing URL in request body' });
    }   


    try {
        setCurrentUser(userId);//for file writer

        const client = getRedisClient();

        let storedValue = await getObjectFromRedis(client, url);

        analizedResultUrl = storedValue !== null ? storedValue.analyzedUrl : '';

        if (!analizedResultUrl) {
            analyzedUrl = await analyzeUrlWithVariations(url, userId, analyze);

            const resultFileName = `${encodeURIComponent(userId)}_${encodeURIComponent(analyzedUrl)}-ai-result.json`;
            const resultFilePath = path.join(outputDirectory, resultFileName);
            const jsonString = await fs.readFile(resultFilePath, 'utf8');

            const objectToStore = { 'analyzedUrl': jsonString, 'finalUrl': analyzedUrl};
            const stringifiedObject = JSON.stringify(objectToStore);
            await client.set(url, stringifiedObject);
            console.log('Analysis result stored in cache');
        } else {
            const storedUrl = storedValue !== null ? storedValue.finalUrl : '';
            const keyUrl = storedUrl !== null ? storedUrl : url;
            analyzedUrl = keyUrl;
            await deleteCachedFileIfExists(userId, outputDirectory);
            await writeFinalResult(keyUrl, JSON.parse(analizedResultUrl), outputDirectory);
            console.log('Analysis result retrieved from cache');
        }

        analysisCompleted = true;
        await userService.updateCredit(userId, userCredit - 1);
        res.json({ message: 'Analysis finished', analyzedUrl });
    } catch (error) {
        console.error('Error processing URL:', error);
        res.status(500).json({ message: error.message });
    }
};

async function getObjectFromRedis(client, key) {
    try {
        const reply = await client.get(key);
        console.log('Retrieved string:', reply);
        const retrievedObject = JSON.parse(reply);
        console.log('Retrieved object:', retrievedObject);
        return retrievedObject;
    } catch (error) {
        console.error('Error retrieving object:', error);
        throw error;
    }
}

const getResult = async (req, res) => {
    const { userId } = req.query;
    const outputDirectory = process.env.OUTPUT_FOLDER;

    // Constructing file paths with userId
    const resultFileName = `${encodeURIComponent(userId)}_${encodeURIComponent(analyzedUrl)}-ai-result.json`;
    const logFileName = `${encodeURIComponent(userId)}_log.txt`;
    const resultFilePath = path.join(outputDirectory, resultFileName);
    const logFilePath = path.join(outputDirectory, logFileName);

    if (!analysisCompleted) {
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
            await deleteCachedFileIfExists(userId, outputDirectory);
            res.send(`<div>${content}</div>`); // Display the content in a div
        } catch (err) {
            console.log('Error reading file:', err);
            res.json({ message: 'Analysis completed but no result file available yet. Processing...', completed: false, analysisCompleted: analysisCompleted });
        }
    }
};

module.exports = { analyzeUrl, getResult };
