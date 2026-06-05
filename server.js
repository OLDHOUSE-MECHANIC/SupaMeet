import 'dotenv/config';
import app from './src/app.js';
import env from './src/config/env.js';
import logger from './src/utils/logger.js';
import prisma from './src/db/client.js';
import { startJobs } from './src/jobs/index.js';

const start = async () => {
  try {
    await prisma.$connect();
    logger.info({ event: 'db_connected' });

    startJobs();

    app.listen(env.PORT, () => {
      logger.info({ event: 'server_started', port: env.PORT });
    });
  } catch (err) {
    logger.error({ event: 'server_start_failed', error: err.message });
    process.exit(1);
  }
};

start();
