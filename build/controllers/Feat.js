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
const mongoose_1 = __importDefault(require("mongoose"));
const Feat_1 = __importDefault(require("../models/Feat")); //Feat? or feat?
const axios_1 = __importDefault(require("axios"));
const APIKey_1 = __importDefault(require("../models/APIKey")); // Import the APIKey model
const sendWebhookMessage = (featName) => {
    const webhookUrl = 'https://discord.com/api/webhooks/1108726527127978036/cQkMNMU1Gt0MWdeVR-U_m6xtzwvqP_NzbBmMIPiKrhB6Ljfu4o5iyoCCG5KmqQFRxIKh';
    const message = `New feat added: ${featName}`;
    axios_1.default
        .post(webhookUrl, { content: message })
        .then((response) => {
        console.log('Webhook message sent successfully');
    })
        .catch((error) => {
        console.error('Failed to send webhook message:', error);
    });
};
const createFeat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, flavortext, prereq, benefit, source } = req.body;
    const apiKey = req.headers.authorization;
    try {
        // Check if the API key exists in the database
        const validApiKey = yield APIKey_1.default.findOne({ key: apiKey });
        if (!validApiKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        const feat = new Feat_1.default({
            _id: new mongoose_1.default.Types.ObjectId(),
            name,
            flavortext,
            prereq,
            benefit,
            source
        });
        const savedFeat = yield feat.save();
        sendWebhookMessage(savedFeat.name);
        res.status(201).json({ feat: savedFeat });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
const readFeatID = (req, res, next) => {
    const featId = req.params.featId;
    return Feat_1.default.findById(featId)
        .then((feat) => (feat ? res.status(200).json({ feat }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};
const readFeat = (req, res, next) => {
    const featName = req.body;
    return Feat_1.default.findOne(featName)
        .then((feat) => (feat ? res.status(200).json({ feat }) : res.status(404).json({ message: 'Feat not found' })))
        .catch((error) => res.status(500).json({ error }));
};
const readAll = (req, res, next) => {
    return Feat_1.default.find()
        .then((feats) => res.status(200).json({ feats }))
        .catch((error) => res.status(500).json({ error }));
};
const updateFeat = (req, res, next) => {
    const featId = req.params.featId;
    return Feat_1.default.findById(featId)
        .then((feat) => {
        if (feat) {
            feat.set(req.body);
            return feat
                .save()
                .then((feat) => res.status(201).json({ feat }))
                .catch((error) => res.status(500).json({ error }));
        }
        else {
            res.status(404).json({ message: 'Not found' });
        }
    })
        .catch((error) => res.status(500).json({ error }));
};
const deleteFeat = (req, res, next) => {
    const featId = req.params.featId;
    return Feat_1.default.findByIdAndDelete(featId)
        .then((feat) => (feat ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};
exports.default = { createFeat, readFeatID, readFeat, readAll, updateFeat, deleteFeat };
