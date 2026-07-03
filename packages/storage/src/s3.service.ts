import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * 📦 S3 Storage Service
 * Provides helper wrappers around AWS S3 / Cloudflare R2 operations.
 */
export class S3StorageService {
    private client: S3Client;
    private defaultBucket: string;

    /**
     * 🏗️ Initialize the S3 Storage Service
     * @param config Configuration parameters for region, credentials, and default bucket.
     */
    constructor(config: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        endpoint?: string; // Support for Custom Endpoints (e.g. Cloudflare R2, MinIO, LocalStack)
        defaultBucket: string;
    }) {
        this.defaultBucket = config.defaultBucket;

        // Construct S3 Client options
        const clientOptions: any = {
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        };

        // If a custom URL endpoint is supplied (e.g., for R2 or local development), inject it
        if (config.endpoint) {
            clientOptions.endpoint = config.endpoint;
            clientOptions.forcePathStyle = true; // Often required for custom endpoints
        }

        this.client = new S3Client(clientOptions);
    }

    /**
     * 📤 Generate a secure Pre-Signed URL for client-side uploads (PUT request).
     * Allows frontend apps to upload files (images, video streams) safely directly to storage bypassing the server.
     */
    async getUploadPresignedUrl(
        key: string,
        contentType: string,
        bucket: string = this.defaultBucket,
        expiresInSeconds: number = 3600 // 1 hour default
    ): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                ContentType: contentType,
            });

            const signedUrl = await getSignedUrl(this.client, command, {
                expiresIn: expiresInSeconds,
            });

            return signedUrl;
        } catch (error) {
            console.error('❌ [Storage Service] Error generating upload presigned URL:', error);
            throw new Error('Failed to generate secure upload URL');
        }
    }

    /**
     * 📥 Generate a secure Pre-Signed URL for downloading/viewing private files (GET request).
     */
    async getDownloadPresignedUrl(
        key: string,
        bucket: string = this.defaultBucket,
        expiresInSeconds: number = 3600 // 1 hour default
    ): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const signedUrl = await getSignedUrl(this.client, command, {
                expiresIn: expiresInSeconds,
            });

            return signedUrl;
        } catch (error) {
            console.error('❌ [Storage Service] Error generating download presigned URL:', error);
            throw new Error('Failed to generate secure access URL');
        }
    }

    /**
     * 🗑️ Delete an object from the storage bucket.
     */
    async deleteObject(
        key: string,
        bucket: string = this.defaultBucket
    ): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            await this.client.send(command);
        } catch (error) {
            console.error('❌ [Storage Service] Error deleting file from S3:', error);
            throw new Error('Failed to securely delete storage asset');
        }
    }
}
