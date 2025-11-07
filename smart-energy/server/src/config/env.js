import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: process.env.PORT || 7000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_energy',
  JWT_SECRET: process.env.JWT_SECRET || 'change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  RESET_TOKEN_EXPIRES_MIN: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 30),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 150,
};

export default env;
