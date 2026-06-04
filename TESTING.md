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
