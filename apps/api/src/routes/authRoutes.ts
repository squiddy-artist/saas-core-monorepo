import { Router } from 'express';
import {
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail
} from '../controllers/authController';
import {
    RegisterSchema,
    LoginSchema,
    TokenRefreshSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema
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
router.post(
    '/refresh',
    (req, res, next) => {
        if (!req.body.refreshToken && req.cookies.refresh_token) {
            req.body.refreshToken = req.cookies.refresh_token;
        }
        next();
    },
    validate(TokenRefreshSchema),
    refresh
);

/**
 * 🚪 Client Session Logout Endpoint
 * POST /api/auth/logout
 */
router.post(
    '/logout',
    (req, res, next) => {
        if (!req.body.refreshToken && req.cookies.refresh_token) {
            req.body.refreshToken = req.cookies.refresh_token;
        }
        next();
    },
    validate(TokenRefreshSchema),
    logout
);

/**
 * 📧 Forgot Password Request Endpoint
 * POST /api/auth/forgot-password
 */
router.post(
    '/forgot-password',
    authRateLimiter,
    validate(ForgotPasswordSchema),
    forgotPassword
);

/**
 * 🔒 Reset Password Endpoint
 * POST /api/auth/reset-password/:token
 */
router.post(
    '/reset-password/:token',
    authRateLimiter,
    validate(ResetPasswordSchema),
    resetPassword
);

/**
 * 📧 Verify Email Endpoint
 * GET /api/auth/verify-email/:token
 */
router.get(
    '/verify-email/:token',
    verifyEmail
);

export default router;
