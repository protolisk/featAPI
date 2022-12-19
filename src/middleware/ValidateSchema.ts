import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Response, Request } from 'express';
import Logging from '../library/Logging';
import { IFeat } from '../models/Feat';
import { createJsxJsxClosingFragment } from 'typescript';

export const ValidateSchema = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);

            next();
        } catch (error) {
            Logging.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    feat: {
        create: Joi.object<IFeat>({
            name: Joi.string().required(),
            flavortext: Joi.string(),
            prereq: Joi.string(),
            benefit: Joi.string().required(),
            source: Joi.string().required()
        }),
        update: Joi.object<IFeat>({
            name: Joi.string().required(),
            flavortext: Joi.string(),
            prereq: Joi.string(),
            benefit: Joi.string().required(),
            source: Joi.string().required()
        })
    }
};
