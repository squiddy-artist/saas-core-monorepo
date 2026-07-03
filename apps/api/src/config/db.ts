import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger'; // Wait, let's imports it. We will write it next.

/**
 * 🍃 Database Connection Manager
 * Manages the MongoDB connection pool and socket lifecycles.
 */
export const connectDB = async (): Promise<void> => {
    try {
        const options = {
            maxPoolSize: 50,                  // 🏊 Max connections in pool (enterprise concurrent scale)
            minPoolSize: 10,                 // 🏊 Min idle connections
            serverSelectionTimeoutMS: 5000,   // ⏱️ Timeout after 5s if replica sets are down
            socketTimeoutMS: 45000,          // ⏱️ Close sockets after 45s of inactivity
        };

        mongoose.connection.on('connected', () => {
            logger.info('🟢 [Database] MongoDB connection established successfully.');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`🔴 [Database] MongoDB connection error: ${err.message}`, err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('🟡 [Database] MongoDB connection disconnected.');
        });

        await mongoose.connect(env.MONGO_URI, options);
    } catch (error: any) {
        logger.error('❌ [Database] Critical database boot failed:', error);
        process.exit(1);
    }
};

export default connectDB;
