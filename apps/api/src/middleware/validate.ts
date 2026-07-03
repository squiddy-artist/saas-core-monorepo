import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

/**
 * 🛡️ Request Validation Middleware
 * Returns an express middleware function validating body, query, or params.
 * @param schema Zod Schema to validate against.
 */
export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validate inputs and pick the parsed output (filters extra unvalidated fields)
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            // Inject clean validated inputs back into express request
            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Collect all parsing errors
                const formatErrors = error.errors.map((err) => `${err.path.join('.').replace('body.', '')}: ${err.message}`);

                // Pass validation error formatted clearly to the error handler middleware
                const errMsg = `Validation mismatch: ${formatErrors.join(' | ')}`;
                return next(new BadRequestError(errMsg));
            }

            next(error);
        }
    };
};

export default validate;
