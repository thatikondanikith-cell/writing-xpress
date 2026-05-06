import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// GET order by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = getOrderById(id);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// PUT update order (admin only - add auth check in production)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contentType = request.headers.get('content-type');

        // Handle file upload for delivery file
        if (contentType?.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('deliveryFile') as File | null;
            const orderStatus = formData.get('orderStatus') as string | null;

            if (file) {
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');

                if (!existsSync(uploadDir)) {
                    mkdirSync(uploadDir, { recursive: true });
                }

                const timestamp = Date.now();
                const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filename = `delivery-${timestamp}-${originalName}`;
                const filepath = path.join(uploadDir, filename);

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filepath, buffer);

                const deliveryFilePath = `/uploads/${filename}`;

                const updates: any = { deliveryFile: deliveryFilePath };
                if (orderStatus) {
                    updates.orderStatus = orderStatus;
                }
                const physicalDeliveryStatus = formData.get('physicalDeliveryStatus') as 'Pending' | 'Delivered' | null;
                if (physicalDeliveryStatus) {
                    updates.physicalDeliveryStatus = physicalDeliveryStatus;
                }

                const updatedOrder = updateOrder(id, updates);

                if (!updatedOrder) {
                    return NextResponse.json(
                        { error: 'Order not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json(updatedOrder);
            }
        }

        // Handle JSON update (status only)
        const body = await request.json();
        // body handles any partial update including physicalDeliveryStatus
        const updatedOrder = updateOrder(id, body);

        if (!updatedOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
