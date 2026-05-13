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

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const existing = await UserModel.findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        const passwordHash = hashPassword(password);

        const user = await UserModel.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}
