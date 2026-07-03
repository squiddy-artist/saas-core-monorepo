import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import storageRoutes from './storageRoutes';

const router = Router();

/**
 * 📡 API Engine Health probe
 * GET /api/health
 */
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: '🚀 The Enterprise Virtuoso Engine is online and sound.'
    });
});

// ⚡ Mount Sub-modules
router.use('/auth', authRoutes);
router.use('/storage', storageRoutes);

export default router;
