import rateLimit from 'express-rate-limit';
import env from '../config/env';

/**
 * 🔒 Enterprise Auth API Rate Limiter
 * Restricts the number of registration and login requests to deter brute-force.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // ⏱️ 15 minutes window
    limit: env.NODE_ENV === 'development' ? 1000 : 20, // 🚫 Dev gets high limits, production gets 20 requests per window
    standardHeaders: 'draft-7', // 📝 standard RateLimit-* headers
    legacyHeaders: false, // 🚫 Disable X-RateLimit-* headers
    message: {
        status: 'fail',
        message: 'Too many authentication attempts. Please try again in 15 minutes 🛑',
    },
});

/**
 * 🌐 Standard Global Rate Limiter
 * Sets general limits across the entire platform.
 */
export const globalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // ⏱️ 1 minute window
    limit: env.NODE_ENV === 'development' ? 10000 : 200, // 🚫 200 requests/min in production
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Extremely high request intensity. Slow down 🛑',
    },
});
