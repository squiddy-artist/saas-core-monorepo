import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
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
    let errors: Record<string, string> | undefined;

    // 1. Detect if the error is a customized Operational Error (AppError)
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;

        if (err instanceof ValidationError) {
            errors = err.errors;
        }
    }
    // 2. Capture JSON payload parsing exceptions
    else if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
        statusCode = 400;
        status = 'fail';
        message = 'Invalid JSON request payload formatting 🗂️';
    }
    // 3. Capture Mongoose Cast errors (e.g. invalid MongoDB ObjectIDs)
    else if (err.name === 'CastError') {
        statusCode = 400;
        status = 'fail';
        message = `Invalid database key identifier format for path: ${(err as any).path} 🔍`;
    }
    // 4. Capture Mongoose Schema validation errors
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        status = 'fail';
        message = 'Database schema validation constraint failed 📝';

        const mongooseErrors = (err as any).errors;
        if (mongooseErrors) {
            errors = {};
            for (const key of Object.keys(mongooseErrors)) {
                errors[key] = mongooseErrors[key].message;
            }
        }
    }
    // 5. Capture MongoDB duplicate key errors (code 11000)
    else if ((err as any).code === 11000) {
        statusCode = 409;
        status = 'fail';
        const field = Object.keys((err as any).keyValue || {})[0] || 'field';
        message = `This ${field} is already in use by another account 💥`;
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
        ...(errors && { errors }),
        // Only include the stack trace for unhandled internal server errors (500+) in development
        ...(env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
    });
};

export default errorHandler;
