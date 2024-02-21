const puppeteer = require('puppeteer');
const { writePartialData, deleteFileIfExists } = require('./fileWriter');
const { analyzeImages } = require('./imageAnalyzer');

async function scrape(url, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory, currentDepth = 0, linksScraped = 0, mainUrl = null) {

    // Delete the file if it exists for the main URL
    if (!mainUrl) {
        await deleteFileIfExists(url, outputDirectory);
    }
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    if (verbose) {
        console.log(`Analyzing URL: ${url}`);
        console.log(`URL parts: ${JSON.stringify(getUrlParts(url))}`);
    }

    if (!mainUrl) {
        mainUrl = url;
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
        console.error(`Error while getting description for ${url}: ${error.message}`);
    }

    if (!mainUrl) {
        let text = null;
        try {
            text = await page.$eval('body', element => element.textContent);
            // Remove extra spaces and newlines
            text = text.replace(/\s{2,}/g, ' ').replace(/\n/g, '');
            data.rawText = text; // Set rawText property
        } catch (error) {
            console.error(`Error while getting text for ${url}: ${error.message}`);
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
                console.log(`Analyzing sublink ${i + 1}/${sublinks.length}: ${sublink}`);
                const sublinkData = await scrape(sublink, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory, currentDepth + 1, linksScraped + 1, mainUrl);
                data.sublinks = data.sublinks || [];
                data.sublinks.push(sublinkData);
                linksScraped++;
            } catch (error) {
                console.error(`Error while analyzing sublink ${sublink}: ${error.message}`);
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