import { NextResponse } from "next/server";
import { getReportById } from "@/lib/data/reports";
import { AiSummaryError, generateSummary } from "@/lib/ai";

export const runtime = "nodejs";

async function buildSummary(id: string) {
  const report = await getReportById(id);
  if (!report) {
    return NextResponse.json(
      { error: "Report not found", id },
      { status: 404 },
    );
  }

  try {
    const summary = await generateSummary(report);
    return NextResponse.json(
      { summary },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    const status = err instanceof AiSummaryError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Unknown AI provider error";
    return NextResponse.json(
      { error: message, code: "ai_summary_failed" },
      { status },
    );
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return buildSummary(id);
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return buildSummary(id);
}
