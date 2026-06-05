import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as analysisController from './analysis.controller.js';

const router = Router({ mergeParams: true });

router.use(auth);

/**
 * @openapi
 * /meetings/{id}/analyze:
 *   post:
 *     tags: [Analysis]
 *     summary: Run full AI analysis on a meeting
 *     description: >
 *       Consumes the full phased context log plus any unflushed live lines.
 *       Returns a structured summary, decisions, follow-up suggestions, and action items —
 *       every item carrying at least one citation back to the transcript.
 *       Also persists extracted action items to the database.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Analysis complete with citations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                           citations:
 *                             type: array
 *                     decisions:
 *                       type: array
 *                     followUps:
 *                       type: array
 *                 actionItems:
 *                   type: array
 *       404:
 *         description: Meeting not found
 *       502:
 *         description: AI provider error or invalid response
 *       401:
 *         description: Unauthorized
 */
router.post('/analyze', analysisController.analyzeMeeting);

export default router;
