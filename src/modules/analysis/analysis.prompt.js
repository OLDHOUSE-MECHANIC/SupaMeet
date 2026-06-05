export const buildChunkSummaryPrompt = (lines, contextSoFar) => {
  const transcript = lines.map(l => `[${l.timestamp}] ${l.speaker}: ${l.text}`).join('\n');

  return `You are a meeting intelligence assistant. Your job is to summarize a chunk of meeting transcript.

${contextSoFar ? `CONTEXT SO FAR (previous phases):\n${contextSoFar}\n\n` : ''}

CURRENT TRANSCRIPT CHUNK:
${transcript}

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "A concise 2-4 sentence summary of what was discussed in this chunk.",
  "actionSignals": ["brief description of any action items emerging, e.g. 'Alice to prepare release notes'"],
  "decisionSignals": ["brief description of any decisions made, e.g. 'Team agreed to delay launch by one week'"]
}

RULES:
- Only reference what is explicitly stated in the transcript chunk above.
- Do not invent speakers, topics, or outcomes.
- If no action signals or decisions exist, return empty arrays.
- Return ONLY the JSON object. No preamble, no explanation.`;
};

export const buildFullAnalysisPrompt = (contextLog, liveLines) => {
  const contextSection = contextLog.map(cl =>
    `[PHASE ${cl.phaseIndex} | ${cl.phaseTimeStart} — ${cl.phaseTimeEnd}]\n${cl.summary}\nAction Signals: ${JSON.parse(cl.actionSignals).join(', ') || 'none'}\nDecision Signals: ${JSON.parse(cl.decisionSignals).join(', ') || 'none'}`
  ).join('\n\n');

  const liveSection = liveLines.map(l => `[${l.timestamp}] ${l.speaker}: ${l.text}`).join('\n');

  return `You are a meeting intelligence assistant. Analyze the full meeting below and extract structured insights.

MEETING CONTEXT LOG (summarized phases):
${contextSection || 'No previous phases.'}

CURRENT LIVE TRANSCRIPT:
${liveSection || 'No live transcript lines.'}

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": [
    {
      "text": "Summary point here.",
      "citations": [{ "type": "phase", "phaseIndex": 0, "timeRange": "00:00 — 00:20" }]
    }
  ],
  "actionItems": [
    {
      "task": "Task description",
      "assignee": "Person name",
      "citations": [{ "type": "live", "timestamp": "00:20", "speaker": "Alice" }]
    }
  ],
  "decisions": [
    {
      "text": "Decision made.",
      "citations": [{ "type": "phase", "phaseIndex": 1, "timeRange": "00:20 — 00:45" }]
    }
  ],
  "followUps": [
    {
      "text": "Follow-up suggestion.",
      "citations": [{ "type": "live", "timestamp": "01:10", "speaker": "John" }]
    }
  ]
}

CITATION RULES:
- For insights from the context log phases: use type "phase" with phaseIndex and timeRange.
- For insights from the live transcript: use type "live" with exact timestamp and speaker.
- Every single item MUST have at least one citation.
- Do NOT invent any attendee, action item, decision, or outcome not explicitly present.
- Return ONLY the JSON object. No preamble, no markdown.`;
};
