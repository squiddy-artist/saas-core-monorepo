import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

// 🛑 Extend Express Request interface to host the User payload
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

/**
 * 🛡️ Token Authenticator Middleware
 * Secures routes by verifying JWT access tokens.
 * Supports credentials delivered via secure HTTP-Only Cookies OR traditional Bearer Tokens.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        let token: string | undefined;

        // 1. Fetch token from cookies (Web Frontend client approach)
        if (req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
        }
        // 2. Fetch token from Authorization headers (Mobile client / Third-party approach)
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 3. Error out if no token is found
        if (!token) {
            throw new UnauthorizedError('Access token is missing 🔑. Please sign in.');
        }

        // 4. Verify token integrity
        const decoded = jwt.verify(token, env.JWT_SECRET) as { user: { id: string } };

        // 5. Inject payload into Request object
        req.user = decoded.user;
        next();
    } catch (error: any) {
        logger.warn(`⚠️ [Auth Middleware] Validation warning: ${error.message}`);

        if (error instanceof jwt.TokenExpiredError) {
            return next(new UnauthorizedError('Access token has expired ⏱️. Please renew session.'));
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return next(new UnauthorizedError('Invalid access signature 🚫. Authenticate again.'));
        }

        next(error);
    }
};

export default requireAuth;
