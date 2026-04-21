import { NextResponse } from "next/server";
import { parseListQuery, queryReports } from "@/lib/data/reports";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = parseListQuery(url.searchParams);
  const reports = await queryReports(query);

  return NextResponse.json(
    {
      query,
      count: reports.length,
      reports,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
