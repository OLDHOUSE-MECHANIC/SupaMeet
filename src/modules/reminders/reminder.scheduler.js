import cron from 'node-cron';
import { processOverdueReminders } from './reminder.service.js';
import logger from '../../utils/logger.js';

// Runs every hour at :00
const reminderScheduler = cron.schedule('0 * * * *', async () => {
  logger.info({ event: 'cron_triggered', job: 'overdue_reminders' });
  await processOverdueReminders();
}, {
  scheduled: false, // don't auto-start; we start it in jobs/index.js
});

export default reminderScheduler;
