import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import MedicationAdherenceCard from './MedicationAdherenceCard';
import type { DoseRecord, Medication } from '@/lib/adherence';

const NOW = new Date('2024-06-30T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

function doses(total: number, taken: number): DoseRecord[] {
  return Array.from({ length: total }, (_, i) => ({
    date: new Date(NOW.getTime() - i * DAY).toISOString(),
    taken: i < taken,
  }));
}

function render(medications: Medication[]): string {
  return renderToStaticMarkup(
    createElement(MedicationAdherenceCard, { medications, now: NOW })
  );
}

describe('MedicationAdherenceCard', () => {
  it('renders an explicit empty state when there are no medications', () => {
    const html = render([]);
    expect(html).toContain('data-testid="medication-adherence-empty"');
    expect(html).toContain('No medications on file.');
    expect(html).not.toContain('data-testid="medication-adherence-item"');
  });

  it('renders each medication with its 30-day adherence percentage', () => {
    const html = render([
      { id: 'a', name: 'Lisinopril', dosage: '10 mg daily', doses: doses(10, 9) },
      { id: 'b', name: 'Metformin', dosage: '500 mg', doses: doses(10, 6) },
    ]);
    expect(html).toContain('Medication Adherence');
    expect(html).toContain('Last 30 days');
    expect(html).toContain('Lisinopril');
    expect(html).toContain('10 mg daily');
    expect(html).toContain('90%');
    expect(html).toContain('Metformin');
    expect(html).toContain('60%');
    expect(html.match(/data-testid="medication-adherence-item"/g)).toHaveLength(2);
  });

  it('visually flags adherence below 80%', () => {
    const html = render([{ id: 'b', name: 'Metformin', doses: doses(10, 7) }]);
    expect(html).toContain('data-adherence-status="low"');
    expect(html).toContain('data-testid="medication-adherence-warning"');
    expect(html).toContain('text-red-600');
    expect(html).toContain('70%');
    expect(html).not.toContain('text-green-600');
  });

  it('does not flag adherence at or above 80%', () => {
    const atThreshold = render([{ id: 'c', name: 'Atorvastatin', doses: doses(10, 8) }]);
    expect(atThreshold).toContain('data-adherence-status="ok"');
    expect(atThreshold).toContain('80%');
    expect(atThreshold).toContain('text-green-600');
    expect(atThreshold).not.toContain('data-testid="medication-adherence-warning"');
    expect(atThreshold).not.toContain('text-red-600');

    const above = render([{ id: 'd', name: 'Aspirin', doses: doses(10, 10) }]);
    expect(above).toContain('data-adherence-status="ok"');
    expect(above).toContain('100%');
    expect(above).not.toContain('data-testid="medication-adherence-warning"');
  });

  it('shows N/A when no doses were scheduled in the window', () => {
    const html = render([{ id: 'e', name: 'Warfarin', doses: [] }]);
    expect(html).toContain('N/A');
    expect(html).toContain('data-adherence-status="ok"');
    expect(html).toContain('0 of 0 doses taken');
  });
});
