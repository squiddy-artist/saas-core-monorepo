/**
 * 🛠️ AppError BASE CLASS
 * All custom API operational errors must extend this class.
 * This guarantees proper status validation and stack traces.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly status: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Marks the error as anticipated (operational) not a system bug

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 🚫 BadRequestError (400)
 */
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request parameters 🛑') {
        super(message, 400);
    }
}

/**
 * 📝 ValidationError (400)
 */
export class ValidationError extends AppError {
    public readonly errors: Record<string, string>;
    constructor(errors: Record<string, string>, message: string = 'Validation failed 🛑') {
        super(message, 400);
        this.errors = errors;
    }
}

/**
 * 🔒 UnauthorizedError (401)
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Access unauthorized. Please login 🔑') {
        super(message, 401);
    }
}

/**
 * ⛔ ForbiddenError (403)
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden 🚫') {
        super(message, 403);
    }
}

/**
 * 🔍 NotFoundError (404)
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Requested resource not found 🔎') {
        super(message, 404);
    }
}

/**
 * ⚔️ ConflictError (409)
 */
export class ConflictError extends AppError {
    constructor(message: string = 'Resource conflict occurred 💥') {
        super(message, 409);
    }
}

/**
 * 🌋 InternalServerError (500)
 */
export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server malfunction 🌋') {
        super(message, 500);
    }
}
