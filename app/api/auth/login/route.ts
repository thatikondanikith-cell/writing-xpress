import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // In a real app, use JWT or session cookies
            // For simplicity, we'll return success and let client handle session
            return NextResponse.json({
                success: true,
                message: 'Login successful'
            });
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
