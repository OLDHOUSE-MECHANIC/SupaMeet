import { z } from 'zod';
import * as transcriptService from './transcript.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const transcriptLineSchema = z.object({
  timestamp: z.string().min(1, 'Timestamp is required'),
  speaker: z.string().min(1, 'Speaker is required'),
  text: z.string().min(1, 'Text is required'),
});

const appendSchema = z.object({
  lines: z.array(transcriptLineSchema).min(1, 'At least one line is required'),
});

export const appendLines = async (req, res, next) => {
  try {
    const parsed = appendSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 400);
    }

    const result = await transcriptService.addTranscriptLines(
      req.params.id,
      req.user.userId,
      parsed.data.lines
    );

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const endMeeting = async (req, res, next) => {
  try {
    const meeting = await transcriptService.endMeeting(req.params.id, req.user.userId);
    return sendSuccess(res, { meeting });
  } catch (err) {
    next(err);
  }
};
