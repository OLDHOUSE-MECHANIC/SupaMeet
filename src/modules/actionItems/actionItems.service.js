import prisma from '../../db/client.js';

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export const createActionItem = async (userId, { meetingId, task, assignee, dueDate }) => {
  // Verify meeting belongs to user
  const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
  if (!meeting) {
    const err = new Error('Meeting not found');
    err.code = 'NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  return prisma.actionItem.create({
    data: {
      meetingId,
      task,
      assignee,
      dueDate: dueDate ? new Date(dueDate) : null,
      citations: JSON.stringify([]),
      status: 'PENDING',
    },
  });
};

export const updateStatus = async (id, userId, status) => {
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    err.code = 'INVALID_STATUS';
    err.statusCode = 400;
    throw err;
  }

  // Verify ownership via meeting
  const item = await prisma.actionItem.findFirst({
    where: { id, meeting: { userId } },
  });

  if (!item) {
    const err = new Error('Action item not found');
    err.code = 'NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  return prisma.actionItem.update({
    where: { id },
    data: { status },
  });
};

export const listActionItems = async (userId, { status, assignee, meetingId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const where = {
    meeting: { userId },
    ...(status && { status }),
    ...(assignee && { assignee }),
    ...(meetingId && { meetingId }),
  };

  const [items, total] = await Promise.all([
    prisma.actionItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.actionItem.count({ where }),
  ]);

  return {
    actionItems: items.map(i => ({ ...i, citations: JSON.parse(i.citations) })),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getOverdue = async (userId) => {
  const items = await prisma.actionItem.findMany({
    where: {
      meeting: { userId },
      status: { not: 'COMPLETED' },
      dueDate: { lt: new Date() },
    },
    include: { meeting: { select: { title: true } } },
    orderBy: { dueDate: 'asc' },
  });

  return items.map(i => ({ ...i, citations: JSON.parse(i.citations) }));
};
