import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as meetingsController from './meetings.controller.js';

const router = Router();

router.use(auth);

/**
 * @openapi
 * /meetings:
 *   post:
 *     tags: [Meetings]
 *     summary: Create a new meeting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, participants, meetingDate]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Sprint Planning
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: [alice@example.com, bob@example.com]
 *               meetingDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-04T10:00:00Z"
 *               transcript:
 *                 type: array
 *                 description: Optional transcript lines to seed at creation
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
 *                       example: Let's plan the sprint.
 *     responses:
 *       201:
 *         description: Meeting created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', meetingsController.createMeeting);

/**
 * @openapi
 * /meetings:
 *   get:
 *     tags: [Meetings]
 *     summary: List all meetings for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of meetings
 *       401:
 *         description: Unauthorized
 */
router.get('/', meetingsController.listMeetings);

/**
 * @openapi
 * /meetings/{id}:
 *   get:
 *     tags: [Meetings]
 *     summary: Get a single meeting with full details
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
 *         description: Meeting details including transcript chunks, analysis and action items
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', meetingsController.getMeeting);

export default router;
