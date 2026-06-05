import prisma from '../../db/client.js';
import env from '../../config/env.js';
import { summarizeChunk } from '../analysis/analysis.service.js';

// Append new transcript lines to the live buffer for a meeting.
// When buffer hits chunk size threshold, flush it.
export const appendLines = async (meetingId, newLines) => {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) {
    const err = new Error('Meeting not found');
    err.code = 'NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  // Get current live (unarchived) lines from DB — stored in a temp chunk with chunkIndex -1
  let liveChunk = await prisma.transcriptChunk.findFirst({
    where: { meetingId, chunkIndex: -1 },
  });

  let currentLines = liveChunk ? JSON.parse(liveChunk.rawLines) : [];
  currentLines = [...currentLines, ...newLines];

  if (currentLines.length >= env.TRANSCRIPT_CHUNK_SIZE) {
    // Flush: archive this chunk and update context
    await flushChunk(meetingId, currentLines, liveChunk?.id);
    return { flushed: true, linesBuffered: 0 };
  }

  // Not enough lines yet — update the live buffer
  if (liveChunk) {
    await prisma.transcriptChunk.update({
      where: { id: liveChunk.id },
      data: { rawLines: JSON.stringify(currentLines) },
    });
  } else {
    await prisma.transcriptChunk.create({
      data: {
        meetingId,
        chunkIndex: -1, // sentinel for live buffer
        rawLines: JSON.stringify(currentLines),
        summary: '',
        phaseTimeStart: currentLines[0]?.timestamp || '',
        phaseTimeEnd: currentLines[currentLines.length - 1]?.timestamp || '',
      },
    });
  }

  return { flushed: false, linesBuffered: currentLines.length };
};

// Archive the current live chunk, summarize it, update context log
const flushChunk = async (meetingId, lines, liveChunkId) => {
  const chunkCount = await prisma.transcriptChunk.count({
    where: { meetingId, NOT: { chunkIndex: -1 } },
  });

  const chunkIndex = chunkCount;
  const phaseTimeStart = lines[0]?.timestamp || '';
  const phaseTimeEnd = lines[lines.length - 1]?.timestamp || '';

  // Get existing context for richer summarization
  const contextLogs = await prisma.contextLog.findMany({
    where: { meetingId },
    orderBy: { phaseIndex: 'asc' },
  });

  const contextSoFar = contextLogs.map(cl =>
    `[PHASE ${cl.phaseIndex} | ${cl.phaseTimeStart} — ${cl.phaseTimeEnd}]\n${cl.summary}`
  ).join('\n\n');

  // Summarize this chunk via AI
  const { summary, actionSignals, decisionSignals } = await summarizeChunk(lines, contextSoFar);

  // Archive the chunk
  if (liveChunkId) {
    await prisma.transcriptChunk.update({
      where: { id: liveChunkId },
      data: {
        chunkIndex,
        summary,
        phaseTimeStart,
        phaseTimeEnd,
        rawLines: JSON.stringify(lines),
      },
    });
  } else {
    await prisma.transcriptChunk.create({
      data: {
        meetingId,
        chunkIndex,
        rawLines: JSON.stringify(lines),
        summary,
        phaseTimeStart,
        phaseTimeEnd,
      },
    });
  }

  // Write context log entry
  await prisma.contextLog.create({
    data: {
      meetingId,
      phaseIndex: chunkIndex,
      phaseTimeStart,
      phaseTimeEnd,
      summary,
      actionSignals: JSON.stringify(actionSignals),
      decisionSignals: JSON.stringify(decisionSignals),
    },
  });
};
