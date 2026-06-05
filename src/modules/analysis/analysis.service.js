import prisma from '../../db/client.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';
import { buildChunkSummaryPrompt, buildFullAnalysisPrompt } from './analysis.prompt.js';

// ── Groq API call ──────────────────────────────────────────────────────────────
const callGroq = async (prompt) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // low temp = less hallucination
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    logger.error({ event: 'groq_error', status: response.status, body });
    const err = new Error(`Groq API call failed: ${response.status} — ${body?.error?.message || 'unknown'}`);
    err.code = 'AI_ERROR';
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// ── Parse and validate JSON from AI ───────────────────────────────────────────
const parseAIJson = (raw) => {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const err = new Error('AI returned invalid JSON');
    err.code = 'AI_PARSE_ERROR';
    err.statusCode = 502;
    throw err;
  }
};

// ── Summarize a single chunk (called by chunker) ───────────────────────────────
export const summarizeChunk = async (lines, contextSoFar) => {
  const prompt = buildChunkSummaryPrompt(lines, contextSoFar);
  const raw = await callGroq(prompt);
  const parsed = parseAIJson(raw);

  return {
    summary: parsed.summary || '',
    actionSignals: parsed.actionSignals || [],
    decisionSignals: parsed.decisionSignals || [],
  };
};

// ── Full end-of-meeting analysis ───────────────────────────────────────────────
export const analyzeMeeting = async (meetingId, userId) => {
  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, userId },
    include: {
      contextLogs: { orderBy: { phaseIndex: 'asc' } },
      chunks: { where: { chunkIndex: -1 } }, // live buffer
    },
  });

  if (!meeting) {
    const err = new Error('Meeting not found');
    err.code = 'NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  const liveLines = meeting.chunks[0] ? JSON.parse(meeting.chunks[0].rawLines) : [];
  const prompt = buildFullAnalysisPrompt(meeting.contextLogs, liveLines);

  logger.info({ meetingId, event: 'analysis_started' });

  const raw = await callGroq(prompt);
  const parsed = parseAIJson(raw);

  // Validate citations exist on every item
  validateCitations(parsed);

  // Upsert analysis
  const analysis = await prisma.analysis.upsert({
    where: { meetingId },
    update: {
      summary: JSON.stringify(parsed.summary || []),
      decisions: JSON.stringify(parsed.decisions || []),
      followUps: JSON.stringify(parsed.followUps || []),
    },
    create: {
      meetingId,
      summary: JSON.stringify(parsed.summary || []),
      decisions: JSON.stringify(parsed.decisions || []),
      followUps: JSON.stringify(parsed.followUps || []),
    },
  });

  // Persist action items from analysis
  if (parsed.actionItems?.length) {
    await prisma.actionItem.createMany({
      data: parsed.actionItems.map(item => ({
        meetingId,
        task: item.task,
        assignee: item.assignee,
        citations: JSON.stringify(item.citations || []),
        status: 'PENDING',
      })),
    });
  }

  logger.info({ meetingId, event: 'analysis_complete' });

  return {
    analysis: {
      summary: parsed.summary,
      decisions: parsed.decisions,
      followUps: parsed.followUps,
    },
    actionItems: parsed.actionItems,
  };
};

// ── Citation guard — every item must have at least one citation ────────────────
const validateCitations = (parsed) => {
  const sections = ['summary', 'decisions', 'followUps', 'actionItems'];
  for (const section of sections) {
    for (const item of parsed[section] || []) {
      if (!item.citations || item.citations.length === 0) {
        logger.warn({ event: 'citation_missing', section, item: item.text || item.task });
        // Soft warn — don't throw, but log. AI may miss edge cases.
      }
    }
  }
};
