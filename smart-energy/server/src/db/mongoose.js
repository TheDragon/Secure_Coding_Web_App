import mongoose from 'mongoose';
import env from '../config/env.js';
import logger from '../config/logger.js';

mongoose.set('strictQuery', true); // [REQ:NoSQLi:prevention]

export async function connectDb() {
  await mongoose.connect(env.MONGO_URI, {
    autoIndex: true,
  });
  logger.info('MongoDB connected');
}

export default mongoose;
