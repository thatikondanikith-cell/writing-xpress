import { NextRequest, NextResponse } from 'next/server';
import { downloadFileFromGridFS } from '@/lib/gridfs';
import path from 'path';
import fs from 'fs';

// Validate that a string is a valid 24-char hex MongoDB ObjectId
function isValidObjectId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
}

// Guess MIME type from file extension
function getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// GET /api/files/[id] — streams a file from MongoDB GridFS or legacy public/uploads
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // --- Legacy fallback: serve files stored before GridFS migration ---
        if (!isValidObjectId(id)) {
            // Sanitize filename: strip path traversal characters
            const safeFilename = path.basename(id);
            const legacyPath = path.join(process.cwd(), 'public', 'uploads', safeFilename);

            if (fs.existsSync(legacyPath)) {
                const buffer = fs.readFileSync(legacyPath);
                const contentType = getMimeType(safeFilename);
                return new NextResponse(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Content-Disposition': `inline; filename="${safeFilename}"`,
                        'Content-Length': buffer.length.toString(),
                    },
                });
            }

            return NextResponse.json(
                { error: 'File not found.' },
                { status: 404 }
            );
        }

        // --- GridFS: serve files stored after migration ---
        const { buffer, filename, contentType } = await downloadFileFromGridFS(id);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}"`,
                'Content-Length': buffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('File fetch error:', error);
        if (error.message === 'File not found in GridFS') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
    }
}