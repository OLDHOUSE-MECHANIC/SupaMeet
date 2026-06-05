
# DECISIONS.md
###### Technical decisions log for SupaMeet.

## Runtime: Node.js + Express

Went with Express over Fastify or Hapi. It's the most minimal option — no magic, just middleware and routes. The ecosystem is vast and every dependency we needed had solid Express support. Predictable, readable, easy to reason about.

## Database: SQLite via Prisma

PostgreSQL was the first instinct but SQLite is the smarter call here. Zero external DB dependency, single file, Prisma supports it identically. Migrations work the same way. Deployment to Render with a persistent disk is straightforward. For an evaluation project this is clean and reliable — one less moving part.

Prisma specifically because the schema file is self-documenting. Models, relations, types — all in one place. It also made the JSON field workaround (for arrays in SQLite) explicit and manageable.

## Authentication: JWT

Assignment literally lists it as an example. Stateless, simple, works perfectly for a REST API. Wrapped in a single middleware that sits in front of protected routes. No sessions, no cookies, no complexity.

## Validation: Zod

Picked Zod over express-validator because schema definitions are cleaner and co-locate naturally with controllers. Errors are structured and easy to extract a message from. TypeScript-friendly as a bonus even though we're in plain JS.

## LLM Provider: Groq

Free tier, fast inference, OpenAI-compatible API. Easy to swap if needed. llama-3.3-70b-versatile is capable enough for meeting summarization and citation-aware extraction. Low temperature (0.1) set on all calls to minimize hallucination.

## External Integration: Resend

Cleanest email API available. Single function call, free tier, reliable delivery. Email reminders feel the most production-appropriate for this use case compared to webhooks or bots.

## Real-time Transcript Architecture

Chose a live chunking approach over a single end-of-meeting transcript submission. Every 15 lines the buffer flushes — raw lines archived, summary written to context log with phase time ranges and action/decision signals. The AI always reads context + current live chunk, never an unbounded raw transcript. This prevents token overflow on long meetings while maintaining full context awareness and citation traceability.

## Logging: Winston

Structured JSON logs out of the box. Every log line carries timestamp and traceId. Simple to configure, widely supported on deployment platforms.

## Reminder Deduplication

Reminders only fire if no reminder has been sent in the last 24 hours for that action item. Prevents spam without needing a complex state machine.
