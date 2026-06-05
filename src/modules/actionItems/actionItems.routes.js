import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as actionItemsController from './actionItems.controller.js';

const router = Router();

router.use(auth);

/**
 * @openapi
 * /action-items:
 *   post:
 *     tags: [Action Items]
 *     summary: Manually create an action item
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meetingId, task, assignee]
 *             properties:
 *               meetingId:
 *                 type: string
 *                 format: uuid
 *               task:
 *                 type: string
 *                 example: Prepare release notes
 *               assignee:
 *                 type: string
 *                 example: Alice
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-10T09:00:00Z"
 *     responses:
 *       201:
 *         description: Action item created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', actionItemsController.createActionItem);

/**
 * @openapi
 * /action-items/overdue:
 *   get:
 *     tags: [Action Items]
 *     summary: Get all overdue action items
 *     description: Returns non-completed items whose dueDate is in the past.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue action items
 *       401:
 *         description: Unauthorized
 */
router.get('/overdue', actionItemsController.getOverdue);  // must stay before /:id

/**
 * @openapi
 * /action-items:
 *   get:
 *     tags: [Action Items]
 *     summary: List action items with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *       - in: query
 *         name: meetingId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Paginated action items
 *       401:
 *         description: Unauthorized
 */
router.get('/', actionItemsController.listActionItems);

/**
 * @openapi
 * /action-items/{id}/status:
 *   patch:
 *     tags: [Action Items]
 *     summary: Update the status of an action item
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Action item not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/status', actionItemsController.updateStatus);

export default router;
