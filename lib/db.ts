import { Order } from './types';
import * as fs from 'fs';
import * as path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'orders.json');

// Ensure data directory and file exist
function ensureDB() {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
}

// Read all orders from database
export function getAllOrders(): Order[] {
    ensureDB();
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data) as Order[];
    } catch (error) {
        console.error('Error reading orders:', error);
        return [];
    }
}

// Get order by ID
export function getOrderById(orderId: string): Order | null {
    const orders = getAllOrders();
    return orders.find(order => order.orderId === orderId) || null;
}

// Generate a unique order ID
export function generateOrderId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const orders = getAllOrders();

    // Find the highest sequence number for today
    const todayOrders = orders.filter(order => order.orderId.startsWith(`WX-${dateStr}`));
    const sequences = todayOrders.map(order => {
        const parts = order.orderId.split('-');
        return parseInt(parts[2], 10);
    });

    const nextSeq = sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
    const seqStr = nextSeq.toString().padStart(4, '0');

    return `WX-${dateStr}-${seqStr}`;
}

// Create a new order
export function createOrder(orderData: Omit<Order, 'orderId' | 'createdDate' | 'orderStatus'>): Order {
    ensureDB();

    const newOrder: Order = {
        ...orderData,
        orderId: generateOrderId(),
        orderStatus: 'Submitted',
        createdDate: new Date().toISOString(),
        physicalDeliveryStatus: 'Pending',
    };

    const orders = getAllOrders();
    orders.push(newOrder);

    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf-8');

    return newOrder;
}

// Update an existing order
export function updateOrder(orderId: string, updates: Partial<Order>): Order | null {
    ensureDB();

    const orders = getAllOrders();
    const index = orders.findIndex(order => order.orderId === orderId);

    if (index === -1) {
        return null;
    }

    orders[index] = { ...orders[index], ...updates };
    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf-8');

    return orders[index];
}
