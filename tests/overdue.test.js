import { describe, it, expect } from '@jest/globals';

// Pure logic test — no DB needed
// Mirrors the exact condition used in actionItems.service.js getOverdue()
const isOverdue = (item) =>
  item.status !== 'COMPLETED' && item.dueDate !== null && new Date(item.dueDate) < new Date();

describe('overdue detection logic', () => {
  it('flags a PENDING item with a past dueDate as overdue', () => {
    const item = { status: 'PENDING', dueDate: '2020-01-01T00:00:00Z' };
    expect(isOverdue(item)).toBe(true);
  });

  it('does not flag a COMPLETED item even with past dueDate', () => {
    const item = { status: 'COMPLETED', dueDate: '2020-01-01T00:00:00Z' };
    expect(isOverdue(item)).toBe(false);
  });

  it('does not flag an item with a future dueDate', () => {
    const item = { status: 'PENDING', dueDate: '2099-01-01T00:00:00Z' };
    expect(isOverdue(item)).toBe(false);
  });

  it('does not flag an item with no dueDate', () => {
    const item = { status: 'PENDING', dueDate: null };
    expect(isOverdue(item)).toBe(false);
  });

  it('flags an IN_PROGRESS item with past dueDate as overdue', () => {
    const item = { status: 'IN_PROGRESS', dueDate: '2020-06-01T00:00:00Z' };
    expect(isOverdue(item)).toBe(true);
  });
});
