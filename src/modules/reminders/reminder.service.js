import { Resend } from 'resend';
import prisma from '../../db/client.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

const resend = new Resend(env.RESEND_API_KEY);

export const sendReminder = async (actionItem) => {
  const dueDate = actionItem.dueDate
    ? new Date(actionItem.dueDate).toDateString()
    : 'No due date set';

  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: actionItem.assignee,
      subject: `Reminder: ${actionItem.task}`,
      html: `
        <h2>Action Item Reminder</h2>
        <p><strong>Task:</strong> ${actionItem.task}</p>
        <p><strong>Assigned To:</strong> ${actionItem.assignee}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Status:</strong> ${actionItem.status}</p>
        <p><em>This is an automated reminder from SuperMEET.</em></p>
      `,
    });

    await prisma.reminderLog.create({
      data: {
        actionItemId: actionItem.id,
        status: 'SENT',
      },
    });

    logger.info({ event: 'reminder_sent', actionItemId: actionItem.id, assignee: actionItem.assignee });
  } catch (err) {
    await prisma.reminderLog.create({
      data: {
        actionItemId: actionItem.id,
        status: 'FAILED',
        errorMessage: err.message,
      },
    });

    logger.error({ event: 'reminder_failed', actionItemId: actionItem.id, error: err.message });
  }
};

export const processOverdueReminders = async () => {
  logger.info({ event: 'reminder_job_started' });

  // Find overdue items that have NOT been reminded in the last 24 hours.
  // Using NOT + some avoids the vacuous-truth problem with `every` on empty
  // relation sets, and correctly handles items with mixed old/recent reminders.
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const overdueItems = await prisma.actionItem.findMany({
    where: {
      status: { not: 'COMPLETED' },
      dueDate: { lt: new Date() },
      NOT: {
        reminders: { some: { sentAt: { gte: oneDayAgo } } },
      },
    },
    include: { reminders: { orderBy: { sentAt: 'desc' }, take: 1 } },
  });

  logger.info({ event: 'overdue_items_found', count: overdueItems.length });

  for (const item of overdueItems) {
    await sendReminder(item);
  }

  logger.info({ event: 'reminder_job_complete' });
};
