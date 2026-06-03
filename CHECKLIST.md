***Auth***

Register user
Login user (returns JWT)
Protect routes via JWT middleware


***Meetings***

Create meeting (with transcript)
Get single meeting by ID
List all meetings (with pagination)
Analyze meeting via LLM (summary, action items, decisions, follow-up suggestions — all cited)


***Action Items***

Create action item (manually)
Update action item status (PENDING → IN_PROGRESS → COMPLETED)
List action items (filter by status, assignee, meeting ID)
Get overdue action items


***Reminders***

Scheduled job (cron) that runs periodically
Finds all overdue action items
Sends reminder via Resend (email)
Logs reminder history to DB


***System / Non-functional***

Unified response format (traceId, success, data / error) on every response
Global error handler
Input validation on all endpoints
Structured logging (timestamp, traceId, method, path, status)
Health endpoint GET /health
Evaluation endpoint GET /api/evaluation
Swagger/OpenAPI docs
