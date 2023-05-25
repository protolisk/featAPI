"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const Feat_1 = __importDefault(require("../controllers/Feat"));
const ValidateSchema_1 = require("../middleware/ValidateSchema");
const router = express_1.default.Router();
router.post('/create', (0, ValidateSchema_1.ValidateSchema)(ValidateSchema_1.Schemas.feat.create), Feat_1.default.createFeat);
router.get('/get/find/:featName', Feat_1.default.readFeat);
router.get('/get/:featId', Feat_1.default.readFeatID);
router.get('/get/', Feat_1.default.readAll);
router.patch('/update/:featId', (0, ValidateSchema_1.ValidateSchema)(ValidateSchema_1.Schemas.feat.update), Feat_1.default.updateFeat);
router.delete('/delete/:featId', Feat_1.default.deleteFeat);
module.exports = router;
