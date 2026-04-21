import { NextResponse } from "next/server";
import { getReportById } from "@/lib/data/reports";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const report = await getReportById(id);

  if (!report) {
    return NextResponse.json(
      { error: "Report not found", id },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { report },
    { headers: { "cache-control": "no-store" } },
  );
}
