import { Suspense } from "react";
import { ReportCard } from "@/components/ReportCard/ReportCard";
import { SearchSortBar } from "@/components/SearchSortBar/SearchSortBar";
import { getRequestBaseUrl } from "@/lib/url";
import type { Report, ListReportsQuery } from "@/lib/types";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

interface ApiResponse {
  query: ListReportsQuery;
  count: number;
  reports: Report[];
}

async function fetchReports(searchParams: URLSearchParams): Promise<ApiResponse> {
  const base = await getRequestBaseUrl();
  const url = `${base}/api/reports${searchParams.size ? `?${searchParams}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load reports (${res.status})`);
  }
  return (await res.json()) as ApiResponse;
}

function buildSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  }
  return params;
}

interface ReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolved = await searchParams;
  const params = buildSearchParams(resolved);
  const data = await fetchReports(params);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Workspace</p>
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.subtitle}>
            {data.count} {data.count === 1 ? "result" : "results"}
            {data.query.q ? <> for &ldquo;{data.query.q}&rdquo;</> : null}
          </p>
        </div>
      </header>

      <Suspense fallback={null}>
        <SearchSortBar />
      </Suspense>

      {data.reports.length === 0 ? (
        <div className={styles.empty}>
          <h2>No reports match your filters.</h2>
          <p>Try clearing the search or changing the sort order.</p>
        </div>
      ) : (
        <ul className={styles.grid}>
          {data.reports.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
