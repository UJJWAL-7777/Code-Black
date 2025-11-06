const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-18970.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 18970
    }
});

module.exports = redisClient

