import express from 'express';
import controller from '../controllers/Feat';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = express.Router();

router.post('/create', ValidateSchema(Schemas.feat.create), controller.createFeat);
router.get('/get/find', controller.readFeat);
router.get('/get/:featId', controller.readFeatID);
router.get('/get/', controller.readAll);
router.patch('/update/:featId', ValidateSchema(Schemas.feat.update), controller.updateFeat);
router.delete('/delete/:featId', controller.deleteFeat);

export = router;
