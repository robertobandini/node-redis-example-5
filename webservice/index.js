// Import packages.
const express = require('express')
const redis = require('redis')
const Redlock = require('redlock')
const { promisify } = require('util')
require('log-timestamp');

// Create and configure a webserver.
const app = express()
app.use(express.json())

// Create and configure a Redis client.
const redisClient = redis.createClient('6379', process.env.REDIS_SERVER_IP)
redisClient.on('error', error =>  console.error(error))
const redisSet = promisify(redisClient.set).bind(redisClient)
const redisGet = promisify(redisClient.get).bind(redisClient)

const redlock = new Redlock(
	[redisClient],
	{
		driftFactor: 0.01,
		retryCount:  -1,
		retryDelay:  200,
		retryJitter:  200
	}
)

redlock.on('clientError', function(err) {
	console.error('A redis error has occurred:', err);
});

// Adding a simple function to wait some time.
const sleep = (ms) =>  new Promise(resolve => setTimeout(resolve, ms))

// Create and endpoint to lock a key value paire and set the value.
app.post('/lockAndSetValue', async (req, res) => {
    console.log('Request received!')
    if (req.body.key && req.body.value) {
        try {
            const resource = `locks:${req.body.key}`
            const ttl = 20000
            redlock.lock(resource, ttl)
                .then(async function(lock) {
                    console.log('Lock acquired!')
                    await redisSet(req.body.key, req.body.value)
                    console.log(`SET key=${req.body.key} value=${req.body.value}`)
                    console.log('Waiting some time...')
                    await sleep(10000)
                    console.log('Time finished, key unlocked!')
                    return lock.unlock()
                .catch(function(err) {
                    console.error(err);
                })
            })
            console.log('Sending response!')
            res.send()
        } catch (e) {
            res.json(e)
        }
    } else {
        res.status(400).json({ error: 'Wrong input.' })
    }
})

// Create an endpoint to set a key value pair.
app.post('/setValue', async (req, res) => {
    if (req.body.key && req.body.value) {
        try {
            await redisSet(req.body.key, req.body.value)
            console.log(`SET key=${req.body.key} value=${req.body.value}`)
            res.send()
        } catch (e) {
            res.json(e)
        }
    } else {
        res.status(400).json({ error: 'Wrong input.' })
    }
})

// Create an endpoint to get a key value pair.
app.get('/getValue/:key', async (req, res) => {
    if (!req.params.key) {
        return res.status(400).json({ error: 'Wrong input.' })
    }

    try {
        const value = await redisGet(req.params.key)
        console.log(`GET key=${req.params.key} value=${value}`)
        res.json(value)
    } catch (e) {
        res.json(e)
    }
})

// Start the webserver.
app.listen(3000, () => {
    console.log('Server is up on port 3000')
})