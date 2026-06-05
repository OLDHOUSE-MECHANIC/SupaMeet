import reminderScheduler from '../modules/reminders/reminder.scheduler.js';
import logger from '../utils/logger.js';

export const startJobs = () => {
  reminderScheduler.start();
  logger.info({ event: 'jobs_started', jobs: ['overdue_reminders'] });
};
