## A Rough Idea
the approach for the efficiently grounded Ai implimentation is to structure a system in realtime during meeting, transcriptions are being stored and and after every few transcription entries the files of transcription (now containing the latest transcribed logs) is sent to the AI to analyze the context inside the meeting. rest portions of citation and hallucination prevention seem just fine.after every 15 to 20 lines in the transcription file, it modifies a context file that holds the summerarise version of all of the previous conversation and stores it under context file and clears transcript file prevent the input from overflowing with far old transcribe but still maintaining a summerized out log of the conversations.

## Prompt Design
Two prompts exist in the system. 

**Chunk Summary Prompt** — fires every time a transcript chunk is flushed (every 15 lines). It receives the raw lines of the current chunk and the context log so far. It returns a short summary of the chunk plus any emerging action and decision signals. This is fast, cheap, and keeps the context log current.  

**Full Analysis Prompt** — fires when the user explicitly calls the analyze endpoint. It receives the full phased context log plus whatever live lines haven't been flushed yet. It returns structured summary, action items, decisions, and follow-up suggestions — all with citations.

Both prompts explicitly instruct the model to return only JSON with no preamble or markdown fences.
