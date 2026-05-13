import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToGridFS } from '@/lib/gridfs';

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

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        const uploadedIds: string[] = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.name}. Only PDF, Word, and PowerPoint files are allowed.` },
                    { status: 400 }
                );
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Use timestamp prefix to keep original filename readable
            const timestamp = Date.now();
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const storedFilename = `${timestamp}-${originalName}`;

            const fileId = await uploadFileToGridFS(buffer, storedFilename, file.type);
            uploadedIds.push(fileId);
        }

        return NextResponse.json({
            success: true,
            files: uploadedIds, // returns GridFS ObjectId strings
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        );
    }
}
