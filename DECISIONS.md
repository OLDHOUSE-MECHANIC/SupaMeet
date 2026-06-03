
***Stage 1: Foundation***   
Started with Express over Fastify or Hapi — it's the most minimal and I know exactly what I'm getting. No magic, just middleware and routes. 
Perfect for keeping things readable. Went with dotenv for env management but wrapped it in a src/config/env.js file. That way I'm never scattering process.env.
WHATEVER all over the codebase — one place, one source of truth, fails loudly if something's missing.Prisma was an easy call for the ORM. 
The schema file is clean, migrations are straightforward, and it basically documents your database design for free. Didn't even consider writing raw SQL for this.
For validation I picked Zod. It's TypeScript-friendly but works just as well in plain JS, and it lets me define schemas that double as documentation. 
express-validator felt too verbose for what we need here.Winston for logging because it supports structured JSON logs out of the box. 
I needed timestamp, traceId, method, path, and status in every log line — Winston makes that trivial to configure. The traceId middleware was a 
deliberate early decision. Attaching a UUID to every request from the very first middleware means it flows through logs and responses automatically. 
Debugging without this is a nightmare. helmet and cors went on as defaults. Security basics, no reason not to.
