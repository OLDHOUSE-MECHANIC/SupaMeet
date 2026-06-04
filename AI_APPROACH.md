## A Rough Idea (Pre-Implimentation)
the approach for the efficiently grounded Ai implimentation is to structure a system in realtime during meeting, transcriptions are being stored and and after every few transcription entries the files of transcription (now containing the latest transcribed logs) is sent to the AI to analyze the context inside the meeting. rest portions of citation and hallucination prevention seem just fine.after every 15 to 20 lines in the transcription file, it modifies a context file that holds the summerarise version of all of the previous conversation and stores it under context file and clears transcript file prevent the input from overflowing with far old transcribe but still maintaining a summerized out log of the conversations.

## Prompt Design
Two prompts exist in the system. 

**Chunk Summary Prompt** — fires every time a transcript chunk is flushed (every 15 lines). It receives the raw lines of the current chunk and the context log so far. It returns a short summary of the chunk plus any emerging action and decision signals. This is fast, cheap, and keeps the context log current.  

**Full Analysis Prompt** — fires when the user explicitly calls the analyze endpoint. It receives the full phased context log plus whatever live lines haven't been flushed yet. It returns structured summary, action items, decisions, and follow-up suggestions — all with citations.

Both prompts explicitly instruct the model to return only JSON with no preamble or markdown fences.

## Citation Strategy

Two-tier citation system:

**Tier 1 — Live citations**: for insights derived from the current unflushed transcript chunk. Each citation carries the exact timestamp and speaker name from the raw transcript line.

**Tier 2 — Phase citations**: for insights derived from the context log (summarized past phases). Each citation carries the phase index and the time range of that phase (e.g. 00:00 — 00:20). The original raw lines are always preserved in the archived TranscriptChunk records, so any phase citation is cross-referenceable.

Every generated item — summary points, action items, decisions, follow-ups — must include at least one citation from either tier.

## Hallucination Prevention## Prompt Design

Two prompts exist in the system.

**Chunk Summary Prompt** — fires every time a transcript chunk is flushed (every 15 lines). It receives the raw lines of the current chunk and the context log so far. It returns a short summary of the chunk plus any emerging action and decision signals. This is fast, cheap, and keeps the context log current.

**Full Analysis Prompt** — fires when the user explicitly calls the analyze endpoint. It receives the full phased context log plus whatever live lines haven't been flushed yet. It returns structured summary, action items, decisions, and follow-up suggestions — all with citations.

Both prompts explicitly instruct the model to return only JSON with no preamble or markdown fences.

---

Three mechanisms work together:

1. **Strict prompt instructions** — both prompts explicitly state the model must not invent speakers, action items, decisions, or outcomes not present in the provided transcript or context.

2. **Low temperature** — all Groq calls run at temperature 0.1. Lower temperature = more conservative, less creative, less hallucinatory output.

3. **Citation validation** — after every AI response, the system checks that every returned item carries at least one citation. Items without citations are logged as warnings. This acts as a soft guard and audit trail.

---

## Output Validation

AI responses are parsed as JSON. If parsing fails the request returns a 502 with code AI_PARSE_ERROR. The system never surfaces raw LLM text to the client — only structured, parsed output.

---

## Known Limitations

- Citation validation is a soft warning, not a hard rejection. An item missing a citation is logged but still returned. A stricter implementation would reject the entire analysis and retry.
- Context log summaries compress information. Very subtle decisions made early in a long meeting may lose nuance in the summary. Raw chunks are always preserved for audit.
- Groq rate limits on the free tier may cause delays during analysis of meetings with many chunks.
- The model is instructed to return JSON only but may occasionally include a preamble. The parser strips common markdown fences as a fallback.
- Model in use is llama-3.3-70b-versatile via Groq. The original llama3-70b-8192 was decommissioned; this is the recommended replacement with equivalent capability.
