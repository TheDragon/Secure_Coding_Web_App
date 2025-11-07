import winston from 'winston';
import 'winston-daily-rotate-file';
import env from './env.js';

const transport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [transport, new winston.transports.Console()],
});

export default logger; // [REQ:Logging:winston]
