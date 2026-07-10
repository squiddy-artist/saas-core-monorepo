import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * 🛡️ Request Validation Middleware
 * Returns an express middleware function validating body, query, or params.
 * @param schema Zod Schema to validate against.
 */
export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Support both root-level nested schemas (body, query, params) and flat body schemas
            const hasRootKeys = 'body' in schema.shape || 'query' in schema.shape || 'params' in schema.shape;

            if (hasRootKeys) {
                const parsed = await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                req.body = parsed.body;
                req.query = parsed.query;
                req.params = parsed.params;
            } else {
                const parsed = await schema.parseAsync(req.body);
                req.body = parsed;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Collect all parsing errors into a key-value map
                const formattedErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.').replace(/^(body|query|params)\./, '').replace(/^(body|query|params)$/, '');
                    const key = path || 'error';
                    formattedErrors[key] = err.message;
                });

                return next(new ValidationError(formattedErrors));
            }

            next(error);
        }
    };
};

export default validate;
