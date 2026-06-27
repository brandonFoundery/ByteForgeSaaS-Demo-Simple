import { NextResponse } from "next/server";
import {
  projectProgramRetriesMetric,
  type FoundryNode,
  type ProgramRetriesMetric,
  type ProgramRetriesOptions,
} from "../../../../lib/metrics";

/**
 * JSON rollup surface for the `program.retries` metric.
 *
 * The hub / tracker / foundry UI fetches this endpoint to render the
 * count flagged by the daily metrics-accuracy audit
 * (fingerprint 985b7efd99f495ab). The endpoint accepts the node rows
 * via POST body so callers (the rollup pipeline) drive intake — no
 * direct tracker writes.
 */
export interface ProgramRetriesRequestBody {
  nodes: FoundryNode[];
  windowDays?: number;
  now?: string;
}

export function buildProgramRetriesResponse(
  body: ProgramRetriesRequestBody,
): ProgramRetriesMetric {
  const opts: ProgramRetriesOptions = {};
  if (typeof body.windowDays === "number") opts.windowDays = body.windowDays;
  if (body.now) opts.now = new Date(body.now);
  return projectProgramRetriesMetric(body.nodes ?? [], opts);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ProgramRetriesRequestBody;
  return NextResponse.json(buildProgramRetriesResponse(body));
}
