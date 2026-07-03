import winston from 'winston';
import env from '../config/env';

/**
 * 📝 Custom Log Formats
 */
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Include stack trace for errors
    winston.format.splat(),
    winston.format.json()
);

const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `[${timestamp}] ${level}: ${stack || message}`;
    })
);

/**
 * 🚀 Winston Logger Implementation
 * Enterprise-grade logging with multi-transports and environmental layouts.
 */
export const logger = winston.createLogger({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        // Write logs to Console
        new winston.transports.Console({
            format: env.NODE_ENV === 'development' ? devFormat : logFormat,
        }),
    ],
});

export default logger;
