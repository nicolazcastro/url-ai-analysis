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
    const filePath = await createFile(data.url, outputDirectory);

    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Data written to file: ${filePath}`);
    } catch (error) {
        console.error(`Error writing data to file ${filePath}: ${error.message}`);
    }
}

module.exports = { writePartialData, createFile };
