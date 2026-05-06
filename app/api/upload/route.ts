import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure upload directory exists
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        const uploadedPaths: string[] = [];

        for (const file of files) {
            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ];

            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.name}. Only PDF, Word, and PowerPoint files are allowed.` },
                    { status: 400 }
                );
            }

            // Create unique filename
            const timestamp = Date.now();
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `${timestamp}-${originalName}`;
            const filepath = path.join(uploadDir, filename);

            // Convert file to buffer and write
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            // Store relative path (from public folder)
            uploadedPaths.push(`/uploads/${filename}`);
        }

        return NextResponse.json({
            success: true,
            files: uploadedPaths
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        );
    }
}
