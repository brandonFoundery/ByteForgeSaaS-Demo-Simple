import { describe, it, expect } from "vitest";
import {
  isRetryTask,
  countProgramRetries,
  countProgramRetriesByProject,
  projectProgramRetriesMetric,
  type FoundryNode,
} from "./metrics";

const NOW = new Date("2026-06-25T00:00:00Z");
const dayAgo = (d: number) =>
  new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

const AUDIT_PROJECT = "a98e9be3-679b-4469-94e2-07ad22b6deac";

describe("isRetryTask", () => {
  it("matches the [RETRY attempt= marker", () => {
    expect(isRetryTask("foo [RETRY attempt=1] bar")).toBe(true);
    expect(isRetryTask("[RETRY attempt=3/5] step")).toBe(true);
  });
  it("is case-insensitive (mirrors ILIKE)", () => {
    expect(isRetryTask("x [retry attempt=2] y")).toBe(true);
  });
  it("rejects non-retry tasks and nullish input", () => {
    expect(isRetryTask("regular task")).toBe(false);
    expect(isRetryTask("")).toBe(false);
    expect(isRetryTask(null)).toBe(false);
    expect(isRetryTask(undefined)).toBe(false);
  });
});

describe("countProgramRetriesByProject", () => {
  it("groups by project_id within the 30d window", () => {
    const nodes: FoundryNode[] = [
      { project_id: "p1", task: "do thing [RETRY attempt=1]", created_at: dayAgo(1) },
      { project_id: "p1", task: "do thing [RETRY attempt=2]", created_at: dayAgo(10) },
      { project_id: "p2", task: "[RETRY attempt=1] other", created_at: dayAgo(5) },
      { project_id: "p1", task: "non retry task", created_at: dayAgo(2) },
    ];
    const counts = countProgramRetriesByProject(nodes, { now: NOW });
    expect(counts).toEqual({ p1: 2, p2: 1 });
  });

  it("excludes nodes outside the window", () => {
    const nodes: FoundryNode[] = [
      { project_id: "p1", task: "[RETRY attempt=1]", created_at: dayAgo(45) },
      { project_id: "p1", task: "[RETRY attempt=2]", created_at: dayAgo(5) },
    ];
    expect(countProgramRetriesByProject(nodes, { now: NOW })).toEqual({ p1: 1 });
  });

  it("respects a custom windowDays", () => {
    const nodes: FoundryNode[] = [
      { project_id: "p1", task: "[RETRY attempt=1]", created_at: dayAgo(3) },
      { project_id: "p1", task: "[RETRY attempt=2]", created_at: dayAgo(10) },
    ];
    expect(countProgramRetriesByProject(nodes, { now: NOW, windowDays: 7 })).toEqual({ p1: 1 });
  });

  it("ignores rows with unparseable timestamps", () => {
    const nodes: FoundryNode[] = [
      { project_id: "p1", task: "[RETRY attempt=1]", created_at: "not-a-date" },
    ];
    expect(countProgramRetriesByProject(nodes, { now: NOW })).toEqual({});
  });
});

describe("countProgramRetries (scalar)", () => {
  it("sums across projects", () => {
    const nodes: FoundryNode[] = [
      { project_id: "p1", task: "[RETRY attempt=1]", created_at: dayAgo(1) },
      { project_id: "p2", task: "[RETRY attempt=1]", created_at: dayAgo(2) },
      { project_id: "p2", task: "skip me", created_at: dayAgo(2) },
    ];
    expect(countProgramRetries(nodes, { now: NOW })).toBe(2);
  });

  it("reproduces the audit finding (project=a98e..., 30d_count=1)", () => {
    const nodes: FoundryNode[] = [
      {
        project_id: AUDIT_PROJECT,
        task: "rerun [RETRY attempt=1/3] worker",
        created_at: dayAgo(2),
      },
    ];
    const metric = projectProgramRetriesMetric(nodes, { now: NOW });
    expect(metric.metric).toBe("program.retries");
    expect(metric.windowDays).toBe(30);
    expect(metric.total).toBe(1);
    expect(metric.byProject[AUDIT_PROJECT]).toBe(1);
  });

  it("reproduces audit fingerprint fdb94a636eb04296 (project=a98e..., 30d_count=3)", () => {
    // Matches the P2 metrics-accuracy audit recomputed value of 3 for
    // project a98e9be3-679b-4469-94e2-07ad22b6deac over a 30d window.
    const nodes: FoundryNode[] = [
      {
        project_id: AUDIT_PROJECT,
        task: "worker A [RETRY attempt=1/3] step",
        created_at: dayAgo(1),
      },
      {
        project_id: AUDIT_PROJECT,
        task: "worker B [RETRY attempt=2/3] step",
        created_at: dayAgo(7),
      },
      {
        project_id: AUDIT_PROJECT,
        task: "worker C [RETRY attempt=3/3] step",
        created_at: dayAgo(20),
      },
      {
        // outside 30d window -- must be excluded
        project_id: AUDIT_PROJECT,
        task: "stale [RETRY attempt=9/9]",
        created_at: dayAgo(45),
      },
      {
        project_id: AUDIT_PROJECT,
        task: "plain non-retry task",
        created_at: dayAgo(2),
      },
    ];
    const metric = projectProgramRetriesMetric(nodes, { now: NOW });
    expect(metric.metric).toBe("program.retries");
    expect(metric.windowDays).toBe(30);
    expect(metric.total).toBe(3);
    expect(metric.byProject[AUDIT_PROJECT]).toBe(3);
    expect(countProgramRetries(nodes, { now: NOW })).toBe(3);
  });
});

describe("projectProgramRetriesMetric (rollup surface)", () => {
  it("returns a stable shape consumable by hub/tracker/foundry UI", () => {
    const metric = projectProgramRetriesMetric([], { now: NOW });
    expect(metric).toEqual({
      metric: "program.retries",
      windowDays: 30,
      total: 0,
      byProject: {},
    });
  });
});
