import { describe, expect, it } from 'vitest';
import { addDays, isSameDay, startOfWeek } from './dates';

describe('startOfWeek', () => {
  it('returns the Monday of the same week', () => {
    const thursday = new Date(2026, 0, 15, 14, 30);
    expect(startOfWeek(thursday)).toEqual(new Date(2026, 0, 12));
  });

  it('treats Sunday as the last day of the week', () => {
    const sunday = new Date(2026, 0, 18, 9, 0);
    expect(startOfWeek(sunday)).toEqual(new Date(2026, 0, 12));
  });
});

describe('isSameDay', () => {
  it('ignores the time of day', () => {
    const morning = new Date(2026, 0, 12, 8, 0);
    expect(isSameDay(morning, new Date(2026, 0, 12, 23, 59))).toBe(true);
    expect(isSameDay(morning, addDays(morning, 1))).toBe(false);
  });
});
