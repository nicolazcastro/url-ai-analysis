const redis = require('redis');

function initializeRedisClient() {
    return new Promise((resolve, reject) => {
        const client = redis.createClient();

        client.on('connect', () => {
            console.log('Redis client connected');
            resolve(client);
        });

        client.on('error', err => {
            console.error('Error connecting to Redis:', err);
            reject(err);
        });
    });
}

module.exports = initializeRedisClient;
