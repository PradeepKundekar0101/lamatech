import type { Report, ListReportsQuery, SortKey, SortDir } from "@/lib/types";
import reportsJson from "./reports.json";

const reports = reportsJson as Report[];

export function getAllReports(): Report[] {
  return reports;
}

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id);
}

const SORTABLE_KEYS: SortKey[] = ["createdAt", "updatedAt", "title", "views"];

function isSortKey(value: string | null | undefined): value is SortKey {
  return !!value && (SORTABLE_KEYS as string[]).includes(value);
}

function isSortDir(value: string | null | undefined): value is SortDir {
  return value === "asc" || value === "desc";
}

export function parseListQuery(searchParams: URLSearchParams): ListReportsQuery {
  const sort = searchParams.get("sort");
  const dir = searchParams.get("dir");
  const category = searchParams.get("category");

  return {
    q: searchParams.get("q") ?? undefined,
    sort: isSortKey(sort) ? sort : undefined,
    dir: isSortDir(dir) ? dir : undefined,
    category: (category ?? undefined) as ListReportsQuery["category"],
  };
}

export function queryReports(query: ListReportsQuery): Report[] {
  const q = query.q?.trim().toLowerCase();
  const sort: SortKey = query.sort ?? "updatedAt";
  const dir: SortDir = query.dir ?? "desc";

  let result = reports.slice();

  if (q) {
    result = result.filter((r) => {
      const haystack = [r.title, r.author, r.summary, r.body, ...r.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (query.category) {
    result = result.filter((r) => r.category === query.category);
  }

  result.sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];

    if (typeof av === "number" && typeof bv === "number") {
      return dir === "asc" ? av - bv : bv - av;
    }

    const as = String(av);
    const bs = String(bv);
    return dir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
  });

  return result;
}
