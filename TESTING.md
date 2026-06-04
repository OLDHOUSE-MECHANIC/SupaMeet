# TESTING.md

---

## Unit Tests

Two test suites cover the most critical logic in the system.

**tests/chunker.test.js** — tests the transcript chunker's `appendLines` function:
- Returns `flushed: false` and correct `liveCount` when under the chunk size threshold
- Throws `NOT_FOUND` when the meeting does not exist
- Throws `MEETING_ENDED` when attempting to append to a closed meeting
- Correctly accumulates lines into the live buffer across calls

**tests/overdue.test.js** — tests the overdue detection predicate as pure logic:
- PENDING item with past dueDate → overdue
- COMPLETED item with past dueDate → not overdue
- PENDING item with future dueDate → not overdue
- PENDING item with no dueDate → not overdue
- IN_PROGRESS item with past dueDate → overdue

Run with:
```bash
npm install
npm test
```

## Manual API Testing

All endpoints were tested manually via Swagger UI at `/api/docs`.

### Scenarios Tested

**Auth**
- Register with valid data → 201, user returned
- Register with duplicate email → 409 DUPLICATE_EMAIL
- Register with invalid email → 400 VALIDATION_ERROR
- Login with correct credentials → 200, token returned
- Login with wrong password → 401 INVALID_CREDENTIALS
- Access protected route without token → 401 UNAUTHORIZED
- Access protected route with expired token → 401 UNAUTHORIZED

**Meetings**
- Create meeting with valid data → 201
- Create meeting with transcript lines → 201, live buffer seeded
- Create meeting missing title → 400 VALIDATION_ERROR
- Create meeting with invalid participant email → 400 VALIDATION_ERROR
- Get meeting by ID → 200 with full details
- Get another user's meeting → 404 NOT_FOUND
- List meetings with pagination → 200 with totalPages

**Transcript**
- Append lines to active meeting → 200, flushed: false
- Append enough lines to trigger flush → 200, flushed: true, context log created
- Append to ended meeting → 400 MEETING_ENDED
- End a meeting → 200, status: ENDED
- Append after end → 400 MEETING_ENDED

**AI Analysis**
- Analyze meeting with transcript → 200, structured result with citations
- Analyze meeting with no transcript → 200, empty sections returned gracefully
- Action items auto-created from analysis output

**Action Items**
- Create manually → 201
- List with status filter → 200
- List with assignee filter → 200
- List with meetingId filter → 200
- Update status to IN_PROGRESS → 200
- Update status to COMPLETED → 200
- Update with invalid status → 400 INVALID_STATUS
- GET /overdue with past dueDate item → 200, item present
- GET /overdue after marking COMPLETED → 200, item gone

**Reminders**
- Scheduler identifies overdue items correctly
- Resend email delivered to assignee
- ReminderLog entry created with status SENT
- Item not re-reminded within 24h window

---

## Edge Cases Considered

- Concurrent appends to the same meeting (not fully handled — last-write-wins on SQLite)
- Analysis called before any transcript exists — handled gracefully, returns empty sections
- Very long meetings (100+ lines) — phased context log keeps prompt size bounded
- Groq returning malformed JSON — caught, returns 502 AI_PARSE_ERROR
- Groq model decommissioned — error now surfaces the actual model error message

---

## Known Limitations

- No integration tests — all inter-module testing is manual
- SQLite does not support true concurrent writes; not suitable for multi-user production load
- Citation validation is a soft warning, not a hard rejection
- Reminder emails require valid RESEND_FROM_EMAIL to be a verified sender domain in Resend
