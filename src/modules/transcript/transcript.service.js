import { appendLines } from './transcript.chunker.js';
import prisma from '../../db/client.js';

export const addTranscriptLines = async (meetingId, userId, lines) => {
  // Verify meeting belongs to user
  const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
  if (!meeting) {
    const err = new Error('Meeting not found');
    err.code = 'NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  if (meeting.status === 'ENDED') {
    const err = new Error('Cannot add transcript to an ended meeting');
    err.code = 'MEETING_ENDED';
    err.statusCode = 400;
    throw err;
  }

  return appendLines(meetingId, lines);
};

export const endMeeting = async (meetingId, userId) => {
  const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, userId } });
  if (!meeting) {
    const err = new Error('Meeting not found');
    err.code = 'NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  return prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'ENDED' },
  });
};
