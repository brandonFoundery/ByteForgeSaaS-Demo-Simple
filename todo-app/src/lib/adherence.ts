/**
 * Medication adherence helpers.
 *
 * Adherence is the share of scheduled doses a patient actually took over the
 * trailing 30-day window. Anything below `ADHERENCE_THRESHOLD` percent is
 * considered "low" and is surfaced with a visual indicator on the dashboard.
 */

/** Trailing window, in days, used for every adherence calculation. */
export const ADHERENCE_WINDOW_DAYS = 30;

/** Adherence at or above this percentage is considered on-track. */
export const ADHERENCE_THRESHOLD = 80;

export interface DoseRecord {
  /** Date the dose was scheduled for (ISO string or Date). */
  date: string | Date;
  /** Whether the patient actually took the scheduled dose. */
  taken: boolean;
}

export interface Medication {
  id: string;
  name: string;
  /** Free-form dosage label, e.g. "10 mg daily". */
  dosage?: string;
  /** Dose log; entries outside the trailing window are ignored. */
  doses: DoseRecord[];
}

export interface MedicationAdherence {
  id: string;
  name: string;
  dosage?: string;
  /** Doses taken inside the trailing window. */
  taken: number;
  /** Doses scheduled inside the trailing window. */
  scheduled: number;
  /** Whole-number percentage 0-100; `null` when nothing was scheduled. */
  adherencePercent: number | null;
  /** True when adherence is known and below the threshold. */
  isBelowThreshold: boolean;
}

function toTime(date: string | Date): number {
  return date instanceof Date ? date.getTime() : Date.parse(String(date));
}

/** True iff a dose falls inside the trailing window ending at `now`. */
export function isWithinWindow(
  date: string | Date,
  now: Date = new Date(),
  windowDays: number = ADHERENCE_WINDOW_DAYS
): boolean {
  const t = toTime(date);
  if (Number.isNaN(t)) return false;
  const end = now.getTime();
  const start = end - windowDays * 24 * 60 * 60 * 1000;
  return t >= start && t <= end;
}

/**
 * Percentage (0-100, rounded) of scheduled doses taken in the trailing window.
 * Returns `null` when no doses were scheduled in the window.
 */
export function calculateAdherence(
  doses: DoseRecord[],
  now: Date = new Date(),
  windowDays: number = ADHERENCE_WINDOW_DAYS
): number | null {
  const inWindow = (doses ?? []).filter((d) => isWithinWindow(d.date, now, windowDays));
  if (inWindow.length === 0) return null;
  const taken = inWindow.filter((d) => d.taken).length;
  return Math.round((taken / inWindow.length) * 100);
}

/** True when adherence is known and strictly below the 80% threshold. */
export function isBelowThreshold(
  percent: number | null,
  threshold: number = ADHERENCE_THRESHOLD
): boolean {
  return percent !== null && percent < threshold;
}

/** Projects a medication into the shape the dashboard card renders. */
export function summarizeMedication(
  medication: Medication,
  now: Date = new Date(),
  windowDays: number = ADHERENCE_WINDOW_DAYS
): MedicationAdherence {
  const inWindow = (medication.doses ?? []).filter((d) =>
    isWithinWindow(d.date, now, windowDays)
  );
  const percent = calculateAdherence(medication.doses ?? [], now, windowDays);
  return {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    taken: inWindow.filter((d) => d.taken).length,
    scheduled: inWindow.length,
    adherencePercent: percent,
    isBelowThreshold: isBelowThreshold(percent),
  };
}

export function summarizeMedications(
  medications: Medication[],
  now: Date = new Date(),
  windowDays: number = ADHERENCE_WINDOW_DAYS
): MedicationAdherence[] {
  return (medications ?? []).map((m) => summarizeMedication(m, now, windowDays));
}
