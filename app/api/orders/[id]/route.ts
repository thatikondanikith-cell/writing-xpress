import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/db';
import { uploadFileToGridFS } from '@/lib/gridfs';

// GET order by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await getOrderById(id);

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

// PUT update order (admin only)
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
            const physicalDeliveryStatus = formData.get('physicalDeliveryStatus') as 'Pending' | 'Delivered' | null;

            if (file) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const timestamp = Date.now();
                const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const storedFilename = `delivery-${timestamp}-${originalName}`;

                // Upload delivery file to GridFS
                const fileId = await uploadFileToGridFS(buffer, storedFilename, file.type);

                const updates: any = { deliveryFile: fileId };
                if (orderStatus) updates.orderStatus = orderStatus;
                if (physicalDeliveryStatus) updates.physicalDeliveryStatus = physicalDeliveryStatus;

                const updatedOrder = await updateOrder(id, updates);

                if (!updatedOrder) {
                    return NextResponse.json(
                        { error: 'Order not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json(updatedOrder);
            }
        }

        // Handle JSON update (status, physicalDeliveryStatus, etc.)
        const body = await request.json();
        const updatedOrder = await updateOrder(id, body);

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
