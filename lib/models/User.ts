import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
}

const UserSchema = new Schema<UserDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        createdAt: { type: String, required: true },
    },
    { versionKey: false }
);

const UserModel: Model<UserDocument> =
    mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;