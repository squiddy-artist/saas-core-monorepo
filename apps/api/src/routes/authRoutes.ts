import { Router } from 'express';
import {
    register,
    login,
    refresh,
    logout
} from '../controllers/authController';
import {
    RegisterSchema,
    LoginSchema
} from '@saas-core/shared-types';
import validate from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * 📝 Client Registration Endpoint
 * POST /api/auth/register
 */
router.post(
    '/register',
    authRateLimiter,
    validate(RegisterSchema),
    register
);

/**
 * 🔑 Client Login Endpoint
 * POST /api/auth/login
 */
router.post(
    '/login',
    authRateLimiter,
    validate(LoginSchema),
    login
);

/**
 * 🔄 Token Renewal Rotation Endpoint
 * POST /api/auth/refresh
 */
router.post('/refresh', refresh);

/**
 * 🚪 Client Session Logout Endpoint
 * POST /api/auth/logout
 */
router.post('/logout', logout);

export default router;
