import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import featRoutes from './routes/Feat';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import APIKey from './models/APIKey';

const router = express();
const discordClient = new Client({
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

/** Connect to MongoDB */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Connected to MongoDB.');
        startServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect to MongoDB.');
        Logging.error(error);
    });

/** Start the server only if connected to MongoDB */
const startServer = () => {
    router.use((req, res, next) => {
        /** Log the request */
        Logging.info(`Incoming -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the response */
            Logging.info(`Outgoing -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
        });
        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** Rules of the API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });

    /** Routes */
    router.use('/feats', featRoutes);

    /** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

    /** Error handling */
    router.use((req, res, next) => {
        const error = new Error('Not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    /** Create server and connect to port */
    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}.`));

    /** Discord bot */
    discordClient.on('ready', () => {
        const user = discordClient.user;
        if (user) {
            Logging.info(`Logged in as ${user.tag}`);
        }
        const heartbeatInterval = discordClient.ws.ping;
        console.log(`Heartbeat interval: ${heartbeatInterval}ms`);
    });

    discordClient.on('messageCreate', async (message) => {
        if (message.content === '!createApiKey') {
            try {
                // Generate API key
                const apiKey = generateApiKey();

                // Save API key to the database
                const newAPIKey = new APIKey({ key: apiKey });
                await newAPIKey.save();

                // Send API key as a direct message to the user
                const author = message.author;
                if (author) {
                    author
                        .send(`Your API key: ${apiKey}`)
                        .then(() => {
                            message.reply('API key sent! Check your direct messages.');
                        })
                        .catch(() => {
                            message.reply('Failed to send API key. Please make sure your direct messages are enabled.');
                        });
                }
            } catch (error) {
                console.error('Failed to create API key:', error);
                message.reply('Failed to create API key. Please try again later.');
            }
        }
    });

    discordClient.login(config.discord.token);
};

function generateApiKey(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        apiKey += characters.charAt(randomIndex);
    }

    return apiKey;
}
