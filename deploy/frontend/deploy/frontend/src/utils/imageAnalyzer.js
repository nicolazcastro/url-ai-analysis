process.env['TF_CPP_MIN_LOG_LEVEL'] = '2';
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const axios = require('axios').default;
const sharp = require('sharp'); // Library for image processing

async function analyzeImages(images, maxImages) {
    const model = await mobilenet.load();

    const results = [];
    for (let i = 0; i < Math.min(images.length, maxImages); i++) {
        const imageSrc = images[i];
        try {
            console.log(`Analyzing image ${i + 1}/${images.length}: ${imageSrc}`);
            let imageBuffer;
            if (imageSrc.toLowerCase().endsWith('.svg')) {
                // Handle SVG format: Convert SVG to PNG
                const { buffer, width, height } = await convertSvgToPng(imageSrc);
                // Resize PNG to original SVG dimensions
                imageBuffer = await resizeImage(buffer, { width, height });
            } else if (imageSrc.toLowerCase().endsWith('.webp')) {
                // Handle WebP format: Convert WebP to JPEG
                imageBuffer = await convertWebpToJpeg(imageSrc);
            } else {
                // For other formats, directly fetch the image buffer
                imageBuffer = await getImageBuffer(imageSrc);
            }
            // Resize image to a consistent size
            const resizedImageBuffer = await resizeImage(imageBuffer, 224);
            const imageTensor = tf.node.decodeImage(resizedImageBuffer);
            const prediction = await model.classify(imageTensor);
            results.push({ src: imageSrc, prediction });
        } catch (error) {
            console.error(`Error while analyzing image ${imageSrc}: ${error.message}`);
        }
    }

    return results;
}

async function getImageBuffer(imageSrc) {
    const response = await axios.get(imageSrc, {
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data, 'binary');
}

async function convertSvgToPng(svgSrc) {
    try {
        const response = await axios.get(svgSrc, { responseType: 'arraybuffer' });
        if (response && response.data) {
            // Use sharp library to convert SVG to PNG
            const originalSvg = Buffer.from(response.data);
            
            // Get original dimensions of the SVG image
            const { width, height } = await sharp(originalSvg).metadata();

            // Convert SVG to PNG while preserving original size
            const pngBuffer = await sharp(originalSvg)
                .png()
                .toBuffer();
                
            return { buffer: pngBuffer, width, height }; // Return PNG buffer along with original dimensions
        } else {
            throw new Error('Empty response received');
        }
    } catch (error) {
        throw new Error(`Error converting SVG to PNG: ${error.message}`);
    }
}

async function convertWebpToJpeg(webpSrc) {
    // Use sharp library to convert WebP to JPEG
    const jpegBuffer = await sharp(Buffer.from(await axios.get(webpSrc, { responseType: 'arraybuffer' }).data))
        .jpeg()
        .toBuffer();
    return jpegBuffer;
}

async function resizeImage(imageBuffer, size) {
    return await sharp(imageBuffer)
        .resize(size) // Resize the image while maintaining aspect ratio
        .toBuffer();
}

module.exports = { analyzeImages };
