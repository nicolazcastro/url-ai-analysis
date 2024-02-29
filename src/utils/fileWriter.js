const fs = require('fs').promises;
const path = require('path');

async function createFile(url, outputDirectory) {
    const fileName = `${encodeURIComponent(url)}.json`;
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
        // Return the new file path
        return filePath;
    }
}

async function writePartialData(data, outputDirectory) {
    const mainUrlFileName = `${encodeURIComponent(data.url)}.json`;
    const mainUrlFilePath = path.join(outputDirectory, mainUrlFileName);

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

async function deleteFileIfExists(url, outputDirectory) {
    const filePath = await createFile(url, outputDirectory);
    const logFilePath = outputDirectory + '/log.txt';
    const resultFilePath = filePath.replace(".json", "-ai-result.json")

    try {
        await fs.unlink(resultFilePath);
        console.log(`Deleted file: ${resultFilePath}`);
    } catch (error) {
        // Ignore error if file does not exist
    }

    try {
        await fs.unlink(logFilePath);
        console.log(`Deleted file: ${logFilePath}`);
    } catch (error) {
        // Ignore error if file does not exist
    }

    try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
    } catch (error) {
        // Ignore error if file does not exist
    }
}

async function writeAiResult(data, outputDirectory, url) {
    const resultFilePath = `${outputDirectory}/${encodeURIComponent(url)}-ai-result.json`;
    await fs.writeFile(resultFilePath, JSON.stringify(data, null, 2));
    console.log(`AI analysis result stored in: ${resultFilePath}`);
}

async function writeLog(messages, outputDirectory) {
    const logFilePath = path.join(outputDirectory, 'log.txt');
    let formattedMessages = Array.isArray(messages) ? messages : [messages];
    formattedMessages = formattedMessages.map(message => `${new Date().toISOString()} - ${message}\n`);

    return new Promise((resolve, reject) => {
        try {
            fs.appendFile(logFilePath, formattedMessages.join(''), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (error) {
            Console.log('Failed to write log');
        }
    });
}

module.exports = { writePartialData, deleteFileIfExists, writeAiResult, writeLog };
