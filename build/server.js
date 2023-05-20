"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const Logging_1 = __importDefault(require("./library/Logging"));
const Feat_1 = __importDefault(require("./routes/Feat"));
const discord_js_1 = require("discord.js");
const APIKey_1 = __importDefault(require("./models/APIKey"));
const router = (0, express_1.default)();
const discordClient = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.DirectMessages, discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent],
    partials: [discord_js_1.Partials.Channel]
});
/** Connect to MongoDB */
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
    Logging_1.default.info('Connected to MongoDB.');
    startServer();
})
    .catch((error) => {
    Logging_1.default.error('Unable to connect to MongoDB.');
    Logging_1.default.error(error);
});
/** Start the server only if connected to MongoDB */
const startServer = () => {
    router.use((req, res, next) => {
        /** Log the request */
        Logging_1.default.info(`Incoming -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on('finish', () => {
            /** Log the response */
            Logging_1.default.info(`Outgoing -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
        });
        next();
    });
    router.use(express_1.default.urlencoded({ extended: true }));
    router.use(express_1.default.json());
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
    router.use('/feats', Feat_1.default);
    /** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));
    /** Error handling */
    router.use((req, res, next) => {
        const error = new Error('Not found');
        Logging_1.default.error(error);
        return res.status(404).json({ message: error.message });
    });
    /** Create server and connect to port */
    http_1.default.createServer(router).listen(config_1.config.server.port, () => Logging_1.default.info(`Server is running on port ${config_1.config.server.port}.`));
    /** Discord bot */
    discordClient.on('ready', () => {
        const user = discordClient.user;
        if (user) {
            Logging_1.default.info(`Logged in as ${user.tag}`);
        }
        const heartbeatInterval = discordClient.ws.ping;
        console.log(`Heartbeat interval: ${heartbeatInterval}ms`);
    });
    discordClient.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
        if (message.content === '!createApiKey') {
            try {
                // Generate API key
                const apiKey = generateApiKey();
                // Save API key to the database
                const newAPIKey = new APIKey_1.default({ key: apiKey });
                yield newAPIKey.save();
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
            }
            catch (error) {
                console.error('Failed to create API key:', error);
                message.reply('Failed to create API key. Please try again later.');
            }
        }
    }));
    discordClient.login('MTEwOTM4NTg0NTk1OTU3NzcxMA.GQx9dP.0WkCcWGPxjQHYbLQfiYJAht8b7vP6NC7vh9-YY');
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
