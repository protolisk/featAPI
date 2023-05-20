import mongoose, { Document, Schema } from 'mongoose';

export interface IAPIKey {
    key: string;
    createdAt: Date;
}

export interface IAPIKeyModel extends IAPIKey, Document {}

const APIKeySchema: Schema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        createdAt: { type: Date, default: Date.now }
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IAPIKeyModel>('APIKey', APIKeySchema);
