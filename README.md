# SupaMeet
making a meeting intelligent assistence system from scratch. why? cuz im bored.

Alr'ight everyone phase 1 of the development in the go.  no better, github is punishing me
lets envision a working project structured.  

PLEASE VISIT THE DECISION DOCUMENTATION TO REACH THE REASONING FOR EVERYTHING I INCLUDED AND ORDERED IN THE FOLLOWING MANNER.




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
