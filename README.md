# SupaMeet
AI-powered meeting intelligence service. Real-time transcript chunking, phased context logging, cited AI analysis, action item tracking, and automated email reminders.  


## Setup

### Prerequisites
- Node.js 18+
- A Groq API key (Get urs today, at console.groq.com. & guess what; it's free!)
- A Resend API key (Get urs today: resend.com)

### Install
```bash
git clone https://github.com/OLDHOUSE-MECHANIC/SupaMeet
cd SupaMeet
npm install
```

### Environment
```bash
cp .env.example .env
# [....... Fill in your keys in .env]
```

### Database
```bash
npm run db:migrate
npm run db:generate
```

### Run
```bash
npm run dev       # development
npm start         # production
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 3000) |
| JWT_SECRET | Secret for signing JWT tokens |
| JWT_EXPIRES_IN | Token expiry (default 7d) |
| GROQ_API_KEY | Groq API key for LLM calls |
| GROQ_MODEL | Groq model (default llama3-70b-8192) |
| RESEND_API_KEY | Resend API key for emails |
| RESEND_FROM_EMAIL | Sender email address |
| TRANSCRIPT_CHUNK_SIZE | Lines before chunk flush (default 15) |

---

## API Usage Examples

### Register
```bash
POST /api/auth/register
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }
```

### Login
```bash
POST /api/auth/login
{ "email": "alice@example.com", "password": "secret123" }
```

### Create Meeting
```bash
POST /api/meetings
Authorization: Bearer <token>
{ "title": "Sprint Planning", "participants": ["alice@example.com"], "meetingDate": "2026-06-04T10:00:00Z" }
```

### Append Transcript Lines
```bash
POST /api/meetings/:id/transcript
Authorization: Bearer <token>
{ "lines": [{ "timestamp": "00:10", "speaker": "Alice", "text": "Let's plan the sprint." }] }
```

### Analyze Meeting
```bash
POST /api/meetings/:id/analyze
Authorization: Bearer <token>
```

### Get Overdue Action Items
```bash
GET /api/action-items/overdue
Authorization: Bearer <token>
```

---

## API Docs
Available at `/api/docs` once running.

## Project-Structure 
###### (idk, if thats ur thing: just in case!)
```
SupaMeet backend/
|
├── prisma/
│   └── schema.prisma        
├── src/
│   ├── config/
│   │   └── env.js             (environment variables here!)
│   ├── db/
│   │   └── client.js          (client instance)
│   ├── middleware/
│   │   ├── auth.js            (JWT verification)
│   │   ├── traceId.js         (Attach traceId to every request)
│   │   └── errorHandler.js    (Global error handler)
│   ├── utils/
│   │   ├── response.js        (Unified success/error response helpers)
│   │   └── logger.js          (Structured logger)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── meetings/
│   │   │   ├── meetings.routes.js
│   │   │   ├── meetings.controller.js
│   │   │   └── meetings.service.js
│   │   ├── transcript/
│   │   │   ├── transcript.routes.js
│   │   │   ├── transcript.controller.js
│   │   │   ├── transcript.service.js
│   │   │   └── transcript.chunker.js  
│   │   ├── analysis/
│   │   │   ├── analysis.routes.js
│   │   │   ├── analysis.controller.js
│   │   │   ├── analysis.service.js
│   │   │   └── analysis.prompt.js        (IMP: Prompt exists here!)
│   │   ├── actionItems/
│   │   │   ├── actionItems.routes.js
│   │   │   ├── actionItems.controller.js
│   │   │   └── actionItems.service.js
│   │   └── reminders/
│   │       ├── reminder.scheduler.js     (node-cron job)
│   │       └── reminder.service.js       (Resend logic)
│   ├── jobs/
│   │   └── index.js               (Register all cron jobs
│   ├── docs/
│   │   └── swagger.js             (Swagger setup)
│   └── app.js                     (Express app setup)
├── server.js                      (Entry point)
├── .env
├── .env.example
└── package.json
```
