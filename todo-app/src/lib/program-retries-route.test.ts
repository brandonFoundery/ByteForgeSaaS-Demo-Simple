import { describe, it, expect } from "vitest";
import {
  buildProgramRetriesResponse,
  type ProgramRetriesRequestBody,
} from "../app/api/metrics/program-retries/route";

const AUDIT_PROJECT = "a98e9be3-679b-4469-94e2-07ad22b6deac";
const NOW = "2026-06-25T00:00:00Z";
const dayAgo = (d: number) =>
  new Date(new Date(NOW).getTime() - d * 24 * 60 * 60 * 1000).toISOString();

describe("program.retries rollup surface (buildProgramRetriesResponse)", () => {
  it("reproduces the audit finding: project=a98e..., 30d_count=2", () => {
    const body: ProgramRetriesRequestBody = {
      now: NOW,
      nodes: [
        {
          project_id: AUDIT_PROJECT,
          task: "worker [RETRY attempt=1/3] step",
          created_at: dayAgo(2),
        },
        {
          project_id: AUDIT_PROJECT,
          task: "worker [RETRY attempt=2/3] step",
          created_at: dayAgo(1),
        },
        {
          project_id: AUDIT_PROJECT,
          task: "non retry task",
          created_at: dayAgo(1),
        },
        {
          // outside the 30d window: must be excluded
          project_id: AUDIT_PROJECT,
          task: "stale [RETRY attempt=9/9]",
          created_at: dayAgo(60),
        },
      ],
    };
    const out = buildProgramRetriesResponse(body);
    expect(out.metric).toBe("program.retries");
    expect(out.windowDays).toBe(30);
    expect(out.total).toBe(2);
    expect(out.byProject[AUDIT_PROJECT]).toBe(2);
  });

  it("returns an empty rollup shape when no nodes are supplied", () => {
    const out = buildProgramRetriesResponse({ nodes: [], now: NOW });
    expect(out).toEqual({
      metric: "program.retries",
      windowDays: 30,
      total: 0,
      byProject: {},
    });
  });

  it("honors a custom windowDays from the request body", () => {
    const out = buildProgramRetriesResponse({
      now: NOW,
      windowDays: 7,
      nodes: [
        { project_id: "p1", task: "[RETRY attempt=1]", created_at: dayAgo(3) },
        { project_id: "p1", task: "[RETRY attempt=2]", created_at: dayAgo(10) },
      ],
    });
    expect(out.windowDays).toBe(7);
    expect(out.total).toBe(1);
    expect(out.byProject).toEqual({ p1: 1 });
  });
});
