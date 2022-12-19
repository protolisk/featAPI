import mongoose, { Document, mongo, Schema } from 'mongoose';

export interface IFeat {
    name: string;
    flavortext: string;
    prereq: string;
    benefit: string;
    source: string;
}

export interface IFeatModel extends IFeat, Document {}

const FeatSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        flavortext: { type: String, required: false },
        prereq: { type: String, required: false },
        benefit: { type: String, required: true },
        source: { type: String, required: true }
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IFeatModel>('Feat', FeatSchema);
