import { describe, it, expect } from '@jest/globals';

// Pure logic tests for chunker behaviour — no DB needed.
// These mirror the exact conditions checked inside appendLines.

const CHUNK_SIZE = 15; // matches env.TRANSCRIPT_CHUNK_SIZE default

// Simulates what appendLines does when deciding whether to flush
const shouldFlush = (existingLines, newLines) =>
  existingLines.length + newLines.length >= CHUNK_SIZE;

// Simulates the line accumulation result
const accumulateLines = (existing, incoming) => [...existing, ...incoming];

// Simulates the MEETING_ENDED guard
const guardMeetingStatus = (meeting) => {
  if (!meeting) {
    const err = new Error('Meeting not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (meeting.status === 'ENDED') {
    const err = new Error('Meeting has ended');
    err.code = 'MEETING_ENDED';
    throw err;
  }
};

describe('transcript chunker — flush threshold', () => {
  it('does not flush when under chunk size', () => {
    const existing = Array(10).fill({ timestamp: '00:01', speaker: 'Alice', text: 'x' });
    const incoming = Array(4).fill({ timestamp: '00:02', speaker: 'Bob', text: 'y' });
    expect(shouldFlush(existing, incoming)).toBe(false);
  });

  it('flushes when lines hit exact chunk size', () => {
    const existing = Array(10).fill({ timestamp: '00:01', speaker: 'Alice', text: 'x' });
    const incoming = Array(5).fill({ timestamp: '00:02', speaker: 'Bob', text: 'y' });
    expect(shouldFlush(existing, incoming)).toBe(true);
  });

  it('flushes when lines exceed chunk size', () => {
    const existing = Array(10).fill({ timestamp: '00:01', speaker: 'Alice', text: 'x' });
    const incoming = Array(10).fill({ timestamp: '00:02', speaker: 'Bob', text: 'y' });
    expect(shouldFlush(existing, incoming)).toBe(true);
  });
});

describe('transcript chunker — line accumulation', () => {
  it('merges existing and new lines in order', () => {
    const existing = [{ timestamp: '00:01', speaker: 'Alice', text: 'First' }];
    const incoming = [{ timestamp: '00:02', speaker: 'Bob', text: 'Second' }];
    const result = accumulateLines(existing, incoming);
    expect(result).toHaveLength(2);
    expect(result[0].speaker).toBe('Alice');
    expect(result[1].speaker).toBe('Bob');
  });

  it('handles empty existing buffer', () => {
    const result = accumulateLines([], [{ timestamp: '00:01', speaker: 'Alice', text: 'Hi' }]);
    expect(result).toHaveLength(1);
  });
});

describe('transcript chunker — meeting status guard', () => {
  it('throws NOT_FOUND when meeting is null', () => {
    expect(() => guardMeetingStatus(null)).toThrow(
      expect.objectContaining({ code: 'NOT_FOUND' })
    );
  });

  it('throws MEETING_ENDED when meeting status is ENDED', () => {
    expect(() => guardMeetingStatus({ id: '1', status: 'ENDED' })).toThrow(
      expect.objectContaining({ code: 'MEETING_ENDED' })
    );
  });

  it('does not throw for an ACTIVE meeting', () => {
    expect(() => guardMeetingStatus({ id: '1', status: 'ACTIVE' })).not.toThrow();
  });
});
