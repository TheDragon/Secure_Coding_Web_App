import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import logger from './config/logger.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeString } from './middleware/sanitize.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(hpp()); // [REQ:NoSQLi:prevention]
app.use(mongoSanitize()); // [REQ:NoSQLi:prevention]
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(env.RATE_LIMIT_MAX) || 150,
});
app.use('/api/auth', authLimiter);

// Safe output encoder utility
app.use((req, res, next) => {
  res.locals.encode = (str) => sanitizeString(String(str || '')); // [REQ:XSS:encode] [REQ:Sanitization:output]
  next();
});

app.use('/api', routes);

// Serve OpenAPI static
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/api/docs', express.static(path.join(__dirname, 'docs')));

app.use(notFound);
app.use(errorHandler); // [REQ:Errors:userFriendly]

export default app;
