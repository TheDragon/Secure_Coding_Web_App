import { createServer } from "http";
import app from "./app.js";
import { connectDb } from "./db/mongoose.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import { seedUsers } from "./utils/seed.js";
import { verifyMailTransport } from "./utils/mail.js";

const server = createServer(app);

async function start() {
  try {
    await connectDb();
    await seedUsers();
    await verifyMailTransport();
    server.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
}

start();

export default server;
