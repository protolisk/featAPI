"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Feat_1 = __importDefault(require("../models/Feat")); //Feat? or feat?
const createFeat = (req, res, next) => {
    const { name, flavortext, prereq, benefit, source } = req.body;
    const feat = new Feat_1.default({
        _id: new mongoose_1.default.Types.ObjectId(),
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
