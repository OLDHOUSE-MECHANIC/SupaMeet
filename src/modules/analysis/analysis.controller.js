import * as analysisService from './analysis.service.js';
import { sendSuccess } from '../../utils/response.js';

export const analyzeMeeting = async (req, res, next) => {
  try {
    const result = await analysisService.analyzeMeeting(req.params.id, req.user.userId);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
