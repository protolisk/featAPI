import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Feat from '../models/Feat'; //Feat? or feat?

const createFeat = (req: Request, res: Response, next: NextFunction) => {
    const { name, flavortext, prereq, benefit, source } = req.body;

    const feat = new Feat({
        _id: new mongoose.Types.ObjectId(),
        name,
        flavortext,
        prereq,
        benefit,
        source
    });
    return feat
        .save()
        .then((feat) => res.status(201).json({ feat }))
        .catch((error) => res.status(500).json({ error }));
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
