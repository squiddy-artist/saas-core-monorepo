import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import env from './config/env';
import connectDB from './config/db';
import logger from './utils/logger';
import masterRouter from './routes';
import errorHandler from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';

/**
 * 🏗️ Setup Express Server Engine
 */
const app: Express = express();
const port = env.PORT;

// 1. 🛡️ Security Middleware Pipelines
app.use(helmet()); // Sets protective security HTTP headers (protects against XSS, clickjacking, etc.)
app.use(
  cors({
    origin: true, // Enables flexible CORS matching, should match specific domains in production
    credentials: true, // Crucial: Allows transfer of secure HTTP-Only cookies
  })
);
app.use(globalRateLimiter); // Protects the API from brute-force spikes

// 2. 🗃️ Request Formatting & Ingress Parsers
app.use(express.json({ limit: '10mb' })); // Allows accepting JSON bodies with size constraints
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Form parser
app.use(cookieParser()); // Extracts credentials and session tokens from incoming cookies

// 3. 📡 API Route Registrations
app.use('/api', masterRouter);

// 4. 🌋 Global Interceptor for Uncaught Operational Exceptions
app.use(errorHandler);

/**
 * 🚀 Boostrap Application lifecycle
 */
const bootstrap = async (): Promise<void> => {
  // Connect to persistent MongoDB databases using pool guidelines
  await connectDB();

  const server = app.listen(port, () => {
    logger.info(`🚀 [Server] Enterprise API engine is running at http://localhost:${port}`);
  });

  // 🛡️ Handles unexpected system shutdowns gracefully (e.g. Docker container restarts)
  const shutdown = () => {
    logger.info('🟡 [Server] Received kill signal. Gracefully closing active processes...');
    server.close(() => {
      logger.info('🟢 [Server] Express connections successfully closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

bootstrap();
export default app;