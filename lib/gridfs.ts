import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { connectDB } from './mongoose';

let bucket: GridFSBucket | null = null;

export async function getGridFSBucket(): Promise<GridFSBucket> {
    await connectDB();

    if (!bucket) {
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database not connected');
        bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    }

    return bucket;
}

/**
 * Upload a file buffer to GridFS.
 * Returns the GridFS file ID as a string.
 */
export async function uploadFileToGridFS(
    buffer: Buffer,
    filename: string,
    mimeType: string
): Promise<string> {
    const bucket = await getGridFSBucket();

    return new Promise((resolve, reject) => {
        const readable = Readable.from(buffer);
       const uploadStream = bucket.openUploadStream(filename, {
    metadata: {
        contentType: mimeType,
    },
});

        readable.pipe(uploadStream);

        uploadStream.on('finish', () => {
            resolve(uploadStream.id.toString());
        });

        uploadStream.on('error', reject);
    });
}

/**
 * Download a file from GridFS by its ID.
 * Returns the file buffer and metadata.
 */
export async function downloadFileFromGridFS(fileId: string): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
}> {
    const bucket = await getGridFSBucket();
    const { ObjectId } = mongoose.Types;

    const objectId = new ObjectId(fileId);

    // Get file metadata
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
        throw new Error('File not found in GridFS');
    }

    const fileMeta = files[0];

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = bucket.openDownloadStream(objectId);

        downloadStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        downloadStream.on('end', () => {
            resolve({
                buffer: Buffer.concat(chunks),
                filename: fileMeta.filename,
                contentType: fileMeta.contentType || 'application/octet-stream',
            });
        });
        downloadStream.on('error', reject);
    });
}

/**
 * Delete a file from GridFS by its ID.
 */
export async function deleteFileFromGridFS(fileId: string): Promise<void> {
    const bucket = await getGridFSBucket();
    const { ObjectId } = mongoose.Types;
    await bucket.delete(new ObjectId(fileId));
}
