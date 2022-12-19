"use strict";
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
const router = (0, express_1.default)();
/** Connect to Mongo*/
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' }) //this is just the end of the connection defined here instead - so we can modify it later easily.
    .then(() => {
    Logging_1.default.info('Connected to mongoDB.');
    StartServer();
})
    .catch((error) => {
    Logging_1.default.error('Unable to connect: ');
    Logging_1.default.error(error);
});
/**Only start the server if we connect to MongoDB */
const StartServer = () => {
    router.use((req, res, next) => {
        /**Log the request */
        Logging_1.default.info(`Incoming -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on('finish', () => {
            /**Log the response */
            Logging_1.default.info(`Incoming -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
        });
        next();
    });
    router.use(express_1.default.urlencoded({ extended: true }));
    router.use(express_1.default.json());
    /**Rules of the API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*'); /**These requests can come in anywhere, but we could put in a set of IPs as well */
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    });
    /**Routes */
    router.use('/feats', Feat_1.default);
    /**Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));
    /**Error handling */
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging_1.default.error(error);
        return res.status(404).json({ message: error.message });
    });
    /**Create server and connect to port */
    http_1.default.createServer(router).listen(config_1.config.server.port, () => Logging_1.default.info(`Server is running on port ${config_1.config.server.port}.`));
};
