import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { S3StorageService } from '@saas-core/storage';
import env from '../config/env';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

const router = Router();

// 🏗️ Lazy-init storage service mapping environment variables
const storageService = new S3StorageService({
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    endpoint: env.AWS_ENDPOINT,
    defaultBucket: env.AWS_BUCKET_NAME,
});

/**
 * 📤 Request Secure PUT Pre-signed URL (Protected Route)
 * POST /api/storage/presigned-upload
 * Requires Auth. Clients query this endpoint with a filename and content-type 
 * to receive a secure direct S3-loading URL.
 */
router.post(
    '/presigned-upload',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { fileName, contentType } = req.body;

            if (!fileName || !contentType) {
                throw new BadRequestError('fileName and contentType are required parameters 📁');
            }

            // Generate a unique object key to avoid namespace collisions (Prefixing with timestamp/user id)
            const userId = req.user?.id;
            const fileKey = `uploads/${userId}-${Date.now()}-${fileName}`;
            logger.info(`✨ [Storage Routes] Requesting presigned put URL for key: ${fileKey}`);

            const signedUrl = await storageService.getUploadPresignedUrl(fileKey, contentType);

            res.status(200).json({
                status: 'success',
                data: {
                    uploadUrl: signedUrl,
                    fileKey: fileKey,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
