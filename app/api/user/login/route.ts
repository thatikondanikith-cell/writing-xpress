import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import UserModel from '@/lib/models/User';
import crypto from 'crypto';

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + (process.env.USER_SECRET || 'wx-salt')).digest('hex');
}
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const passwordHash = hashPassword(password);
        console.log("Entered Hash:", passwordHash);
console.log("Stored Hash:", user.passwordHash);
        if (passwordHash !== user.passwordHash) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}