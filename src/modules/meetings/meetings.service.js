import prisma from '../../db/client.js';
import { appendLines } from '../transcript/transcript.chunker.js';

export const createMeeting = async (userId, { title, participants, meetingDate, transcript }) => {
  const meeting = await prisma.meeting.create({
    data: {
      title,
      participants: JSON.stringify(participants),
      meetingDate: new Date(meetingDate),
      userId,
    },
  });

  // If transcript lines were provided at creation, seed the live buffer
  if (transcript && transcript.length > 0) {
    await appendLines(meeting.id, transcript);
  }

  return meeting;
};

export const getMeeting = async (id, userId) => {
  const meeting = await prisma.meeting.findFirst({
    where: { id, userId },
    include: {
      chunks: { orderBy: { chunkIndex: 'asc' } },
      contextLogs: { orderBy: { phaseIndex: 'asc' } },
      analysis: true,
      actionItems: true,
    },
  });

  if (!meeting) {
    const err = new Error('Meeting not found');
    err.code = 'NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  return parseMeeting(meeting);
};

export const listMeetings = async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        participants: true,
        meetingDate: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.meeting.count({ where: { userId } }),
  ]);

  return {
    meetings: meetings.map(m => ({
      ...m,
      participants: JSON.parse(m.participants),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const parseMeeting = (meeting) => ({
  ...meeting,
  participants: JSON.parse(meeting.participants),
  chunks: meeting.chunks.map(c => ({
    ...c,
    rawLines: JSON.parse(c.rawLines),
  })),
  contextLogs: meeting.contextLogs.map(cl => ({
    ...cl,
    actionSignals: JSON.parse(cl.actionSignals),
    decisionSignals: JSON.parse(cl.decisionSignals),
  })),
  analysis: meeting.analysis ? {
    ...meeting.analysis,
    summary: JSON.parse(meeting.analysis.summary),
    decisions: JSON.parse(meeting.analysis.decisions),
    followUps: JSON.parse(meeting.analysis.followUps),
  } : null,
  actionItems: meeting.actionItems.map(ai => ({
    ...ai,
    citations: JSON.parse(ai.citations),
  })),
});
