import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import env from '../config/env';
import {
    BadRequestError,
    UnauthorizedError,
    ConflictError
} from '../utils/errors';
import logger from '../utils/logger';

// 🍪 Cookie Configuration Helpers
const COOKIE_OPTIONS = {
    httpOnly: true,                          // 🛡️ Guard against XSS access
    secure: env.NODE_ENV === 'production',   // 🔒 Only transmit over HTTPS in production
    sameSite: 'lax' as const,                // 🛡️ Prevent CSRF attacks
    maxAge: 15 * 60 * 1000,                  // ⏱️ 15 minutes for access token
};

const REFRESH_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,         // ⏱️ 7 days lifecycle
};

/**
 * 🏭 Auth Controller
 * Coordinates registration, login, logout, and token rotation operations.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // 1. Double check database integrity (avoid duplication)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ConflictError('This email is already registered 📧');
        }

        // 2. Hash raw password (round=10)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Persist user schema
        const newUser = new User({
            name,
            email,
            passwordHash,
        });

        await newUser.save();
        logger.info(`👤 [Auth Controller] New user registered: ${email}`);

        res.status(201).json({
            status: 'success',
            message: 'Account created successfully 🎉',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Verify existence of user
        const user = await User.findOne({ email });
        if (!user) {
            throw new UnauthorizedError('Invalid credentials supplied 🔑');
        }

        // 2. Compare hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedError('Invalid credentials supplied 🔑');
        }

        // 3. Issue Token Passport (Access & Refresh tokens)
        const accessToken = jwt.sign(
            { user: { id: user._id } },
            env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { user: { id: user._id } },
            env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Save refresh token to user model (for rotation/revocation)
        user.refreshTokens.push(refreshToken);
        await user.save();

        // 5. Ingress cookies into client response
        res.cookie('access_token', accessToken, COOKIE_OPTIONS);
        res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

        logger.info(`🔑 [Auth Controller] User logged in: ${email}`);

        res.status(200).json({
            status: 'success',
            token: accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 🔄 Token Rotation Service (Refresh Tokens)
 * Prevents session re-plays. Once a refresh token is used, it is rotated.
 * If a token is reused, we invoke automatic token reuse detection and clear user sessions.
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.refresh_token || req.body.refreshToken;

        if (!token) {
            throw new UnauthorizedError('Refresh token missing 🔄. Authenticate again.');
        }

        // 1. Verify refresh token signature
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { user: { id: string } };

        // 2. Fetch User associated with decoded token
        const user = await User.findById(decoded.user.id);
        if (!user) {
            throw new UnauthorizedError('Account could not be retrieved 👥');
        }

        // 3. Check if refresh token is in valid list
        const tokenIndex = user.refreshTokens.indexOf(token);

        // DETECT REUSE / INTRUSION 🚨
        if (tokenIndex === -1) {
            // Refresh token used, but not in DB! Implying someone else used it.
            // Emergency: Clear all sessions for security reasons.
            user.refreshTokens = [];
            await user.save();

            res.clearCookie('access_token', COOKIE_OPTIONS);
            res.clearCookie('refresh_token', REFRESH_COOKIE_OPTIONS);

            logger.error(`🚨 [Security Alarm] Replay attack detected. Revoked all tokens for user ID: ${user._id}`);
            throw new UnauthorizedError('Session hijacked ⚠️. All login credentials revoked. Please sign in again.');
        }

        // 4. Generate new pair of tokens
        const newAccessToken = jwt.sign(
            { user: { id: user._id } },
            env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const newRefreshToken = jwt.sign(
            { user: { id: user._id } },
            env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Rotate token: Remove used token and add new one
        user.refreshTokens.splice(tokenIndex, 1);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        // 6. Set new cookies in response headers
        res.cookie('access_token', newAccessToken, COOKIE_OPTIONS);
        res.cookie('refresh_token', newRefreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            status: 'success',
            token: newAccessToken,
        });
    } catch (error: any) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new UnauthorizedError('Invalid session refresh signature 🔄'));
        }
        next(error);
    }
};

/**
 * 🚪 User Logout Controller
 * Clears cookies and removes the specific refresh token from database tracking.
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.refresh_token || req.body.refreshToken;

        if (token) {
            // Find user and strip active token from DB lists
            const decoded = jwt.decode(token) as { user: { id: string } } | null;
            if (decoded && decoded.user) {
                await User.findByIdAndUpdate(decoded.user.id, {
                    $pull: { refreshTokens: token }
                });
            }
        }

        // Clear response cookies
        res.clearCookie('access_token', COOKIE_OPTIONS);
        res.clearCookie('refresh_token', REFRESH_COOKIE_OPTIONS);

        logger.info('🚪 [Auth Controller] User logged out successfully.');

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully 🚪',
        });
    } catch (error) {
        next(error);
    }
};
