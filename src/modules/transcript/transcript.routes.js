import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as transcriptController from './transcript.controller.js';

const router = Router({ mergeParams: true });

router.use(auth);

/**
 * @openapi
 * /meetings/{id}/transcript:
 *   post:
 *     tags: [Transcript]
 *     summary: Append transcript lines to a meeting's live buffer
 *     description: >
 *       Lines are buffered in real time. Every 15 lines the buffer flushes —
 *       the chunk is archived, summarised by AI, and a context log entry is written.
 *       Returns whether a flush occurred and how many lines remain buffered.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lines]
 *             properties:
 *               lines:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [timestamp, speaker, text]
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       example: "00:10"
 *                     speaker:
 *                       type: string
 *                       example: Alice
 *                     text:
 *                       type: string
 *                       example: We should launch next Friday.
 *     responses:
 *       200:
 *         description: Lines appended. flushed=true if a chunk was archived.
 *       400:
 *         description: Validation error or meeting already ended
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 */
router.post('/transcript', transcriptController.appendLines);

/**
 * @openapi
 * /meetings/{id}/end:
 *   patch:
 *     tags: [Transcript]
 *     summary: Mark a meeting as ended
 *     description: Sets meeting status to ENDED. Further transcript appends will be rejected.
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
 *         description: Meeting ended
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/end', transcriptController.endMeeting);

export default router;
