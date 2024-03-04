const redis = require('redis');

function getRedisClient() {
    try {
      const client = redis.createClient();
  
      client.on('error', err => {
          console.error('Error connecting to Redis:', err);
      });
  
      client.on('connect', () => {
          console.log('Redis client connected');
      });
  
      client.connect();
      return client;
    } catch (e) {
      console.error(e);
    }
  }

module.exports = getRedisClient;
