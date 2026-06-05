import { z } from 'zod';
import * as meetingsService from './meetings.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const transcriptLineSchema = z.object({
  timestamp: z.string().min(1, 'Timestamp is required'),
  speaker: z.string().min(1, 'Speaker is required'),
  text: z.string().min(1, 'Text is required'),
});

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  participants: z.array(z.string().email('Invalid participant email')).min(1),
  meetingDate: z.string().datetime('Invalid date format'),
  transcript: z.array(transcriptLineSchema).optional(),
});

export const createMeeting = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 400);
    }

    const meeting = await meetingsService.createMeeting(req.user.userId, parsed.data);
    return sendSuccess(res, { meeting }, 201);
  } catch (err) {
    next(err);
  }
};

export const getMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingsService.getMeeting(req.params.id, req.user.userId);
    return sendSuccess(res, { meeting });
  } catch (err) {
    next(err);
  }
};

export const listMeetings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const result = await meetingsService.listMeetings(req.user.userId, { page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
