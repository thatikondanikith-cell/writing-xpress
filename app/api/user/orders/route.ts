import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import OrderModel from '@/lib/models/Order';

export async function GET(request: NextRequest) {
    const userAuth = request.cookies.get('userAuth');

        if (!userAuth) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const orders = await OrderModel.find({ email: email.toLowerCase().trim() })
            .sort({ createdDate: -1 })
            .lean();

        const result = orders.map((doc: any) => {
            const { _id, __v, ...rest } = doc;
            return rest;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}