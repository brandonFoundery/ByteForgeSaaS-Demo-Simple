import {
  ADHERENCE_THRESHOLD,
  ADHERENCE_WINDOW_DAYS,
  summarizeMedications,
  type Medication,
} from "@/lib/adherence";

export interface MedicationAdherenceCardProps {
  medications: Medication[];
  /** Reference "now" for the trailing window; defaults to the current time. */
  now?: Date;
}

export default function MedicationAdherenceCard({
  medications,
  now,
}: MedicationAdherenceCardProps) {
  const rows = summarizeMedications(medications ?? [], now ?? new Date());

  return (
    <section
      data-testid="medication-adherence-card"
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        Medication Adherence
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Last {ADHERENCE_WINDOW_DAYS} days
      </p>

      {rows.length === 0 ? (
        <p data-testid="medication-adherence-empty" className="text-center text-gray-500 py-6">
          No medications on file.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              data-testid="medication-adherence-item"
              data-medication-id={row.id}
              data-adherence-status={row.isBelowThreshold ? "low" : "ok"}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-gray-700 font-medium truncate">{row.name}</p>
                {row.dosage ? (
                  <p className="text-xs text-gray-500 truncate">{row.dosage}</p>
                ) : null}
                <p className="text-xs text-gray-400">
                  {row.taken} of {row.scheduled} doses taken
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  data-testid="medication-adherence-percent"
                  className={
                    row.isBelowThreshold
                      ? "text-red-600 font-semibold"
                      : "text-green-600 font-semibold"
                  }
                >
                  {row.adherencePercent === null
                    ? "N/A"
                    : `${row.adherencePercent}%`}
                </span>
                {row.isBelowThreshold ? (
                  <span
                    data-testid="medication-adherence-warning"
                    role="img"
                    aria-label={`${row.name} adherence below ${ADHERENCE_THRESHOLD}%`}
                    title={`Below ${ADHERENCE_THRESHOLD}% adherence`}
                    className="px-2 py-0.5 text-xs rounded bg-red-50 text-red-700 border border-red-200"
                  >
                    ⚠ Low
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
