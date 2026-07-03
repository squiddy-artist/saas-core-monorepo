import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment files
dotenv.config();

/**
 * 🛠️ Environment Configuration Schema
 * Uses Zod to parse and validate process.env on startup.
 * Crucial for avoiding running with incomplete settings!
 */
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    MONGO_URI: z.string({ required_error: '🍃 MONGO_URI is required' }),
    JWT_SECRET: z.string({ required_error: '🔑 JWT_SECRET is required' }),
    JWT_REFRESH_SECRET: z.string({ required_error: '🔄 JWT_REFRESH_SECRET is required' }),

    // Storage configurations (Optional defaults check for general startup, or strict if upload route is used)
    AWS_REGION: z.string().default('us-east-1'),
    AWS_ACCESS_KEY_ID: z.string().default('mock-key'),
    AWS_SECRET_ACCESS_KEY: z.string().default('mock-secret'),
    AWS_BUCKET_NAME: z.string().default('saas-bucket'),
    AWS_ENDPOINT: z.string().optional(),
});

// Safely parse env
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ [Config] Invalid environment configuration variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1); // Crucial: Kill application if configuration is bad
}

export const env = parsed.data;
export default env;
