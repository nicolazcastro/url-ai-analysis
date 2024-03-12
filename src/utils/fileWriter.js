const fs = require('fs').promises;
const path = require('path');
let currentUser = null;

function setCurrentUser(userId){
    currentUser = userId;
}

async function createFile(fileKey, outputDirectory, ext = 'json') {
    const fileName = `${encodeURIComponent(currentUser)}_${encodeURIComponent(fileKey)}.${ext}`;    
    const filePath = path.join(outputDirectory, fileName);
    try {
        await fs.access(filePath);
        // File already exists, return the same file path
        return filePath;
    } catch (error) {
        // File does not exist, check if the directory exists
        try {
            await fs.access(outputDirectory);
        } catch (dirError) {
            // Directory does not exist, create it
            await fs.mkdir(outputDirectory, { recursive: true });
        }
        // Create the file
        try {
            await fs.writeFile(filePath, ''); // Empty file
            return filePath;
        } catch (fileError) {
            throw new Error(`Failed to create file ${filePath}: ${fileError.message}`);
        }
    }
}

async function writePartialData(data, outputDirectory) {
    const mainUrlFilePath = await createFile(data.url, outputDirectory);

    try {
        let existingData = {};
        try {
            const existingContent = await fs.readFile(mainUrlFilePath, 'utf8');
            existingData = JSON.parse(existingContent);
        } catch (error) {
            // Ignore error if file does not exist or is empty
        }

        // Add or update data for the main URL
        existingData.url = data.url;
        existingData.title = data.title;
        existingData.description = data.description;
        existingData.text = data.text;
        existingData.rawText = data.rawText;

        // Initialize or create an array to store images
        existingData.images = existingData.images || [];
        // Append new images to the array
        existingData.images.push(...data.images);

        // Initialize or create an array to store sublinks
        existingData.sublinks = existingData.sublinks || [];
        
        // Initialize or create an array to store sublinks
        existingData.sublinks = existingData.sublinks || [];

        // Append new sublinks to the array
        if (data.sublinks && Array.isArray(data.sublinks)) {
            existingData.sublinks = [...existingData.sublinks, ...data.sublinks];
        }

        await fs.writeFile(mainUrlFilePath, JSON.stringify(existingData, null, 2));
        console.log(`Data written to file: ${mainUrlFilePath}`);
    } catch (error) {
        console.error(`Error writing data to file ${mainUrlFilePath}: ${error.message}`);
    }
}

async function deleteFileIfExists(userId, outputDirectory) {
    try {
        // Check if the directory exists
        await fs.access(outputDirectory, fs.constants.F_OK);
    } catch (error) {
        console.error(`Output directory ${outputDirectory} does not exist.`);
        return;
    }

    try {
        const files = await fs.readdir(outputDirectory);
        const userFiles = files.filter(file => file.startsWith(`${userId}_`));

        for (const file of userFiles) {
            const filePath = path.join(outputDirectory, file);
            try {
                await fs.unlink(filePath);
                console.log(`Deleted file: ${filePath}`);
            } catch (error) {
                console.error(`Error deleting file ${filePath}: ${error.message}`);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${outputDirectory}: ${error.message}`);
    }
}

async function writeAiResult(data, outputDirectory, fileName) {
    const filePath = await createFile(fileName, outputDirectory);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`AI analysis result stored in: ${filePath}`);
}


async function writeLog(messages, outputDirectory) {
    const logFileName = `log`;
    const logFilePath = await createFile(logFileName, outputDirectory, 'txt');
    const formattedMessages = Array.isArray(messages) ? messages : [messages];
    const logContent = formattedMessages.map(message => `${new Date().toISOString()} - ${message}\n`).join('');

    try {
        await fs.appendFile(logFilePath, logContent);
        console.log(`Log appended to file: ${logFilePath}`);
    } catch (error) {
        console.error(`Error appending log to file ${logFilePath}: ${error.message}`);
    }
}

module.exports = { writePartialData, deleteFileIfExists, writeAiResult, writeLog, setCurrentUser, createFile };
