import { Order } from './types';
import { connectDB } from './mongoose';
import OrderModel from './models/Order';

// Helper to convert a Mongoose document to a plain Order object
function toOrder(doc: any): Order {
    const obj = doc.toObject ? doc.toObject() : doc;
    // Remove MongoDB internal fields
    const { _id, __v, ...rest } = obj;
    return rest as Order;
}

// Read all orders from database
export async function getAllOrders(): Promise<Order[]> {
    await connectDB();
    const docs = await OrderModel.find().sort({ createdDate: -1 }).lean();
    return docs.map((doc: any) => {
        const { _id, __v, ...rest } = doc;
        return rest as Order;
    });
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
    await connectDB();
    const doc = await OrderModel.findOne({ orderId }).lean();
    if (!doc) return null;
    const { _id, __v, ...rest } = doc as any;
    return rest as Order;
}

// Generate a unique order ID (WX-YYYYMMDD-XXXX)
export async function generateOrderId(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    // Find the highest sequence number for today
    const todayOrders = await OrderModel.find({
        orderId: { $regex: `^WX-${dateStr}-` },
    })
        .select('orderId')
        .lean();

    const sequences = todayOrders.map((order: any) => {
        const parts = order.orderId.split('-');
        return parseInt(parts[2], 10);
    });

    const nextSeq = sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
    const seqStr = nextSeq.toString().padStart(4, '0');

    return `WX-${dateStr}-${seqStr}`;
}

// Create a new order
export async function createOrder(
    orderData: Omit<Order, 'orderId' | 'createdDate' | 'orderStatus'>
): Promise<Order> {
    await connectDB();

    const newOrder: Order = {
        ...orderData,
        orderId: await generateOrderId(),
        orderStatus: 'Submitted',
        createdDate: new Date().toISOString(),
        physicalDeliveryStatus: 'Pending',
    };

    const doc = await OrderModel.create(newOrder);
    return toOrder(doc);
}

// Update an existing order
export async function updateOrder(
    orderId: string,
    updates: Partial<Order>
): Promise<Order | null> {
    await connectDB();

    const doc = await OrderModel.findOneAndUpdate(
        { orderId },
        { $set: updates },
        { new: true } // return the updated document
    ).lean();

    if (!doc) return null;
    const { _id, __v, ...rest } = doc as any;
    return rest as Order;
}
