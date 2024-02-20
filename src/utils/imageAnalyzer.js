const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const axios = require('axios').default;

async function analyzeImages(images, maxImages) {
    const model = await mobilenet.load();

    const results = [];
    for (let i = 0; i < Math.min(images.length, maxImages); i++) {
        const imageSrc = images[i];
        try {
            console.log(`Analyzing image ${i + 1}/${images.length}: ${imageSrc}`);
            const imageBuffer = await getImageBuffer(imageSrc);
            const imageTensor = tf.node.decodeImage(imageBuffer);
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

module.exports = analyzeImages;
