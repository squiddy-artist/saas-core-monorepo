import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import env from '../config/env';

/**
 * 🌋 Centralized Error Responder
 * Catches all errors triggered within routes or middlewares.
 * Formats errors and logs them. In production, stack traces are stripped for system security.
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let status = 'error';
    let message = 'An unexpected error occurred on our engine 🌋';

    // 1. Detect if the error is a customized Operational Error (AppError)
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;
    }

    // 2. Log error details using our Winston logger
    logger.error(`💥 [Error Handler] Error occurred: ${err.message}`, {
        method: req.method,
        url: req.url,
        stack: err.stack,
    });

    // 3. Respond back with standardized API JSON envelope
    res.status(statusCode).json({
        status,
        message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }), // Double shield: stack trace visible ONLY in Dev
    });
};

export default errorHandler;
