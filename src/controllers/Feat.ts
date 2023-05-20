import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Feat from '../models/Feat'; //Feat? or feat?
import axios from 'axios';
import APIKey from '../models/APIKey'; // Import the APIKey model

const sendWebhookMessage = (featName: string) => {
    const webhookUrl = 'https://discord.com/api/webhooks/1108726527127978036/cQkMNMU1Gt0MWdeVR-U_m6xtzwvqP_NzbBmMIPiKrhB6Ljfu4o5iyoCCG5KmqQFRxIKh';
    const message = `New feat added: ${featName}`;

    axios
        .post(webhookUrl, { content: message })
        .then((response) => {
            console.log('Webhook message sent successfully');
        })
        .catch((error) => {
            console.error('Failed to send webhook message:', error);
        });
};

const createFeat = async (req: Request, res: Response, next: NextFunction) => {
    const { name, flavortext, prereq, benefit, source } = req.body;
    const apiKey = req.headers.authorization;

    try {
        // Check if the API key exists in the database
        const validApiKey = await APIKey.findOne({ key: apiKey });
        if (!validApiKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        const feat = new Feat({
            _id: new mongoose.Types.ObjectId(),
            name,
            flavortext,
            prereq,
            benefit,
            source
        });

        const savedFeat = await feat.save();

        sendWebhookMessage(savedFeat.name);
        res.status(201).json({ feat: savedFeat });
    } catch (error) {
        res.status(500).json({ error });
    }
};
const readFeatID = (req: Request, res: Response, next: NextFunction) => {
    const featId = req.params.featId;

    return Feat.findById(featId)
        .then((feat) => (feat ? res.status(200).json({ feat }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};
const readFeat = (req: Request, res: Response, next: NextFunction) => {
    const featName = req.body;
    return Feat.findOne(featName)
        .then((feat) => (feat ? res.status(200).json({ feat }) : res.status(404).json({ message: 'Feat not found' })))
        .catch((error) => res.status(500).json({ error }));
};
const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Feat.find()
        .then((feats) => res.status(200).json({ feats }))
        .catch((error) => res.status(500).json({ error }));
};
const updateFeat = (req: Request, res: Response, next: NextFunction) => {
    const featId = req.params.featId;
    return Feat.findById(featId)
        .then((feat) => {
            if (feat) {
                feat.set(req.body);
                return feat
                    .save()
                    .then((feat) => res.status(201).json({ feat }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};
const deleteFeat = (req: Request, res: Response, next: NextFunction) => {
    const featId = req.params.featId;

    return Feat.findByIdAndDelete(featId)
        .then((feat) => (feat ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};

export default { createFeat, readFeatID, readFeat, readAll, updateFeat, deleteFeat };
