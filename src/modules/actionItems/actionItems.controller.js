import { z } from 'zod';
import * as actionItemsService from './actionItems.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const createSchema = z.object({
  meetingId: z.string().uuid('Invalid meeting ID'),
  task: z.string().min(1, 'Task is required'),
  assignee: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().datetime('Invalid date format').optional(),
});

const statusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
    errorMap: () => ({ message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' }),
  }),
});

export const createActionItem = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 400);
    }

    const item = await actionItemsService.createActionItem(req.user.userId, parsed.data);
    return sendSuccess(res, { actionItem: item }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 400);
    }

    const item = await actionItemsService.updateStatus(req.params.id, req.user.userId, parsed.data.status);
    return sendSuccess(res, { actionItem: item });
  } catch (err) {
    next(err);
  }
};

export const listActionItems = async (req, res, next) => {
  try {
    const { status, assignee, meetingId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const result = await actionItemsService.listActionItems(req.user.userId, {
      status, assignee, meetingId, page, limit,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getOverdue = async (req, res, next) => {
  try {
    const items = await actionItemsService.getOverdue(req.user.userId);
    return sendSuccess(res, { actionItems: items });
  } catch (err) {
    next(err);
  }
};
