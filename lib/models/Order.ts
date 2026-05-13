import mongoose, { Schema, Document, Model } from 'mongoose';
import { Order } from '../types';

export interface OrderDocument extends Omit<Order, 'orderId'>, Document {
    orderId: string;
}

const OrderSchema = new Schema<OrderDocument>(
    {
        orderId: { type: String, required: true, unique: true },
        userName: { type: String, required: true },
        primaryPhone: { type: String, required: true },
        alternatePhone: { type: String },
        email: { type: String, required: true },
        address: { type: String },
        collegeName: { type: String, required: true },
        yearOfStudying: { type: String, required: true },
        branch: { type: String, required: true },
        uploadedFiles: { type: [String], required: true },
        instructions: { type: String, required: true },
        priceAmount: { type: Number },
        transactionId: { type: String },
        orderStatus: {
            type: String,
            enum: ['Submitted', 'In Progress', 'Completed'],
            default: 'Submitted',
            required: true,
        },
        createdDate: { type: String, required: true },
        deliveryFile: { type: String },
        physicalDeliveryStatus: {
            type: String,
            enum: ['Pending', 'Delivered'],
            default: 'Pending',
        },
    },
    {
        // Don't use Mongoose's default _id as the main identifier;
        // we keep our custom orderId (WX-YYYYMMDD-XXXX) as the public ID.
        versionKey: false,
    }
);

// Prevent model recompilation on hot reloads
const OrderModel: Model<OrderDocument> =
    mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);

export default OrderModel;
