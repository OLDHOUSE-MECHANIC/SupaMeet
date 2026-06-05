# SupaMeet
AI-powered meeting intelligence service. Real-time transcript chunking, phased context logging, cited AI analysis, action item tracking, and automated email reminders.  


## Setup

### Prequisites

### Install

### Environment

### Database

### Run

### Environment Variables

---

## API Usage Examples


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
