/**
 * Foundry V2 metric projection helpers.
 *
 * Surfaces the `program.retries` metric, which the daily metrics-accuracy
 * audit flagged as an unsurfaced-capability. The source-of-truth query
 * counts nodes whose `task` text contains the `[RETRY attempt=` marker:
 *
 *   SELECT project_id, COUNT(*) FROM foundry_v2.nodes
 *    WHERE task ILIKE '%[RETRY attempt=%'
 *      AND created_at >= NOW() - INTERVAL '30 days'
 *    GROUP BY project_id
 *
 * These helpers reproduce that projection in TypeScript so the hub /
 * tracker / foundry UI can ingest the same value via the normal rollup
 * surface instead of writing tracker rows directly.
 */

export interface FoundryNode {
  project_id: string;
  task: string | null | undefined;
  created_at: string | Date;
}

export interface ProgramRetriesOptions {
  /** Cut-off window in days. Defaults to 30 to match the audit query. */
  windowDays?: number;
  /** Reference "now" timestamp; defaults to Date.now(). */
  now?: Date;
}

export const RETRY_MARKER_REGEX = /\[RETRY attempt=/i;

/** Returns true iff a task string contains the `[RETRY attempt=` marker. */
export function isRetryTask(task: string | null | undefined): boolean {
  if (!task) return false;
  return RETRY_MARKER_REGEX.test(task);
}

function withinWindow(createdAt: string | Date, cutoff: number): boolean {
  const t = createdAt instanceof Date ? createdAt.getTime() : Date.parse(String(createdAt));
  if (Number.isNaN(t)) return false;
  return t >= cutoff;
}

/**
 * Aggregate retry counts per project_id within the configured window.
 * Mirrors the audit's GROUP BY projection.
 */
export function countProgramRetriesByProject(
  nodes: Iterable<FoundryNode>,
  opts: ProgramRetriesOptions = {},
): Record<string, number> {
  const windowDays = opts.windowDays ?? 30;
  const now = opts.now ?? new Date();
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;

  const counts: Record<string, number> = {};
  for (const node of nodes) {
    if (!isRetryTask(node.task)) continue;
    if (!withinWindow(node.created_at, cutoff)) continue;
    counts[node.project_id] = (counts[node.project_id] ?? 0) + 1;
  }
  return counts;
}

/** Total retries across all projects (scalar surface for the hub card). */
export function countProgramRetries(
  nodes: Iterable<FoundryNode>,
  opts: ProgramRetriesOptions = {},
): number {
  return Object.values(countProgramRetriesByProject(nodes, opts)).reduce(
    (a, b) => a + b,
    0,
  );
}

/**
 * Shape returned by the metric rollup endpoint that the hub / tracker /
 * foundry UI consumes. Includes both the scalar and per-project breakdown
 * so each surface can render the value without a bespoke query.
 */
export interface ProgramRetriesMetric {
  metric: "program.retries";
  windowDays: number;
  total: number;
  byProject: Record<string, number>;
}

export function projectProgramRetriesMetric(
  nodes: Iterable<FoundryNode>,
  opts: ProgramRetriesOptions = {},
): ProgramRetriesMetric {
  const windowDays = opts.windowDays ?? 30;
  const byProject = countProgramRetriesByProject(nodes, { ...opts, windowDays });
  const total = Object.values(byProject).reduce((a, b) => a + b, 0);
  return { metric: "program.retries", windowDays, total, byProject };
}
