import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getAllOrders } from '@/lib/db';
import { Order } from '@/lib/types';

// GET all orders (admin only - add auth check in production)
export async function GET(request: NextRequest) {
    try {
        const orders = getAllOrders();
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST create new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            'userName',
            'primaryPhone',
            'email',
            'collegeName',
            'yearOfStudying',
            'branch',
            'uploadedFiles',
            'instructions',
            'priceAmount',
            'transactionId'
        ];

        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate files array
        if (!Array.isArray(body.uploadedFiles) || body.uploadedFiles.length === 0) {
            return NextResponse.json(
                { error: 'At least one file must be uploaded' },
                { status: 400 }
            );
        }

        const orderData: Omit<Order, 'orderId' | 'createdDate' | 'orderStatus'> = {
            userName: body.userName,
            primaryPhone: body.primaryPhone,
            alternatePhone: body.alternatePhone,
            email: body.email,
            address: body.address,
            collegeName: body.collegeName,
            yearOfStudying: body.yearOfStudying,
            branch: body.branch,
            uploadedFiles: body.uploadedFiles,
            instructions: body.instructions,
            priceAmount: body.priceAmount,
            transactionId: body.transactionId,
        };

        const newOrder = createOrder(orderData);

        return NextResponse.json(newOrder, { status: 201 });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
