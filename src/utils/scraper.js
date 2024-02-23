const puppeteer = require('puppeteer');
const { writePartialData, deleteFileIfExists, writeLog } = require('./fileWriter');
const { analyzeImages } = require('./imageAnalyzer');


async function scrape(url, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory, currentDepth = 0, linksScraped = 0, mainUrl = null, setRawText = false) {

    // Delete the file if it exists for the main URL
    if (!mainUrl) {
        await deleteFileIfExists(url, outputDirectory);
    }
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    if (verbose) {
        const logMessage = [`Analyzing URL: ${url}`, `URL parts: ${JSON.stringify(getUrlParts(url))}`];
        console.log(logMessage);
        writeLog(logMessage, outputDirectory);
    }

    if (!mainUrl) {
        mainUrl = url;
        setRawText = true;
    } 

    const data = {
        url: mainUrl,
        title: await page.title()
    };

    let description = null;
    try {
        description = await getDescription(page);
        data.description = description;
    } catch (error) {
        logMessage = `Error while getting description for ${url}: ${error.message}`;
        console.log(logMessage);
        writeLog(logMessage, outputDirectory);
    }

    if (setRawText === true) {
        setRawText = false;
        let text = null;
        try {
            logMessage = `Analyzing raw page text`;
            console.log(logMessage);
            writeLog(logMessage, outputDirectory);

            text = await page.$eval('body', element => element.textContent);
            // Remove extra spaces and newlines
            text = text.replace(/\s{2,}/g, ' ').replace(/\n/g, '');
            data.rawText = text; // Set rawText property
        } catch (error) {
            logMessage = `Error while getting text for ${url}: ${error.message}`;
            console.log(logMessage);
            writeLog(logMessage, outputDirectory);
        }
    }

    const images = await page.$$eval('img', imgs => imgs.map(img => img.src));
    const analyzedImages = await analyzeImages(images, maxImages);

    data.images = analyzedImages.map(analyzedImage => {
        return {
            src: analyzedImage.src,
            description: analyzedImage.prediction
        };
    });

    if (currentDepth < depth && linksScraped < maxLinksPerScrape) {
        const sublinks = await page.$$eval('a', links => links.map(link => link.href));
        for (let i = 0; i < sublinks.length && linksScraped < maxLinksPerScrape; i++) {
            const sublink = sublinks[i];
            try {
                logMessage = `Analyzing sublink ${i + 1}/${sublinks.length}: ${sublink}`;
                console.log(logMessage);
                writeLog(logMessage, outputDirectory);
                const sublinkData = await scrape(sublink, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory, currentDepth + 1, linksScraped + 1, mainUrl, setRawText);
                data.sublinks = data.sublinks || [];
                data.sublinks.push(sublinkData);
                linksScraped++;
            } catch (error) {
                logMessage = `Error while analyzing sublink ${sublink}: ${error.message}`;
                console.log(logMessage);
                writeLog(logMessage, outputDirectory);
            }
        }
    }

    await writePartialData(data, outputDirectory);
    await browser.close();
    return data;
}

async function getDescription(page) {
    const descriptionElement = await page.$('meta[name="description"]');
    if (descriptionElement) {
        return await descriptionElement.evaluate(element => element.content);
    }
    return null; // Return null if description element is not found
}

function getUrlParts(url) {
    const urlParts = url.split('/');
    return urlParts.filter(part => part !== '');
}

module.exports = scrape;
