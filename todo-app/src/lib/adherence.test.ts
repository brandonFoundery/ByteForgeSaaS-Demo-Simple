import { describe, it, expect } from 'vitest';
import {
  ADHERENCE_THRESHOLD,
  ADHERENCE_WINDOW_DAYS,
  calculateAdherence,
  isBelowThreshold,
  isWithinWindow,
  summarizeMedication,
  summarizeMedications,
  type DoseRecord,
} from './adherence';

const NOW = new Date('2024-06-30T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

function doses(total: number, taken: number, now: Date = NOW): DoseRecord[] {
  return Array.from({ length: total }, (_, i) => ({
    date: new Date(now.getTime() - i * DAY).toISOString(),
    taken: i < taken,
  }));
}

describe('constants', () => {
  it('uses a trailing 30-day window', () => expect(ADHERENCE_WINDOW_DAYS).toBe(30));
  it('uses an 80% threshold', () => expect(ADHERENCE_THRESHOLD).toBe(80));
});

describe('isWithinWindow', () => {
  it('accepts a dose inside the window', () =>
    expect(isWithinWindow(new Date(NOW.getTime() - 5 * DAY), NOW)).toBe(true));
  it('rejects a dose older than 30 days', () =>
    expect(isWithinWindow(new Date(NOW.getTime() - 31 * DAY), NOW)).toBe(false));
  it('rejects a future dose', () =>
    expect(isWithinWindow(new Date(NOW.getTime() + DAY), NOW)).toBe(false));
  it('rejects an unparsable date', () => expect(isWithinWindow('not-a-date', NOW)).toBe(false));
});

describe('calculateAdherence', () => {
  it('returns null when nothing is scheduled in the window', () =>
    expect(calculateAdherence([], NOW)).toBeNull());

  it('ignores doses outside the trailing 30-day window', () => {
    const log: DoseRecord[] = [
      { date: new Date(NOW.getTime() - DAY).toISOString(), taken: true },
      { date: new Date(NOW.getTime() - 90 * DAY).toISOString(), taken: false },
    ];
    expect(calculateAdherence(log, NOW)).toBe(100);
  });

  it('rounds to the nearest whole percent', () =>
    expect(calculateAdherence(doses(3, 2), NOW)).toBe(67));

  it('returns 0 when no doses were taken', () =>
    expect(calculateAdherence(doses(10, 0), NOW)).toBe(0));
});

describe('isBelowThreshold', () => {
  it('flags 79%', () => expect(isBelowThreshold(79)).toBe(true));
  it('does not flag exactly 80%', () => expect(isBelowThreshold(80)).toBe(false));
  it('does not flag 95%', () => expect(isBelowThreshold(95)).toBe(false));
  it('does not flag unknown adherence', () => expect(isBelowThreshold(null)).toBe(false));
});

describe('summarizeMedication', () => {
  it('projects counts and percentage for a low-adherence medication', () => {
    const summary = summarizeMedication(
      { id: 'm1', name: 'Metformin', dosage: '500 mg', doses: doses(10, 6) },
      NOW
    );
    expect(summary).toMatchObject({
      id: 'm1',
      name: 'Metformin',
      dosage: '500 mg',
      taken: 6,
      scheduled: 10,
      adherencePercent: 60,
      isBelowThreshold: true,
    });
  });

  it('does not flag adherence at exactly the threshold', () => {
    const summary = summarizeMedication(
      { id: 'm2', name: 'Lisinopril', doses: doses(10, 8) },
      NOW
    );
    expect(summary.adherencePercent).toBe(80);
    expect(summary.isBelowThreshold).toBe(false);
  });
});

describe('summarizeMedications', () => {
  it('returns an empty projection for an empty list', () =>
    expect(summarizeMedications([], NOW)).toEqual([]));

  it('summarizes each medication', () => {
    const rows = summarizeMedications(
      [
        { id: 'a', name: 'A', doses: doses(10, 9) },
        { id: 'b', name: 'B', doses: doses(10, 5) },
      ],
      NOW
    );
    expect(rows.map((r) => r.adherencePercent)).toEqual([90, 50]);
    expect(rows.map((r) => r.isBelowThreshold)).toEqual([false, true]);
  });
});
