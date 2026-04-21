import "server-only";
import type {
  ListReportsQuery,
  Report,
  ReportCategory,
  SortDir,
  SortKey,
} from "@/lib/types";
import type { ReportRow } from "@/lib/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TABLE = "reports";

const SORTABLE_KEYS: SortKey[] = ["createdAt", "updatedAt", "title", "views"];
const SORT_COLUMN: Record<SortKey, keyof ReportRow> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  title: "title",
  views: "views",
};

const VALID_CATEGORIES: ReportCategory[] = [
  "growth",
  "engineering",
  "finance",
  "product",
  "research",
];

function isSortKey(value: string | null | undefined): value is SortKey {
  return !!value && (SORTABLE_KEYS as string[]).includes(value);
}

function isSortDir(value: string | null | undefined): value is SortDir {
  return value === "asc" || value === "desc";
}

function isCategory(value: string | null | undefined): value is ReportCategory {
  return !!value && (VALID_CATEGORIES as string[]).includes(value);
}

export function parseListQuery(searchParams: URLSearchParams): ListReportsQuery {
  const sort = searchParams.get("sort");
  const dir = searchParams.get("dir");
  const category = searchParams.get("category");

  return {
    q: searchParams.get("q") ?? undefined,
    sort: isSortKey(sort) ? sort : undefined,
    dir: isSortDir(dir) ? dir : undefined,
    category: isCategory(category) ? category : undefined,
  };
}

function rowToReport(row: ReportRow): Report {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    status: row.status,
    summary: row.summary,
    body: row.body,
    views: row.views,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Escape a user-provided substring so it can safely sit inside a
 * Postgrest `.or("col.ilike.%X%")` expression. Postgrest uses `%` and `_`
 * as wildcards, and `,` / `(` / `)` as OR-expression delimiters.
 */
function escapeIlikeTerm(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, "\\,")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export async function queryReports(query: ListReportsQuery): Promise<Report[]> {
  const supabase = await createSupabaseServerClient();

  const sortKey: SortKey = query.sort ?? "updatedAt";
  const sortDir: SortDir = query.dir ?? "desc";

  let builder = supabase
    .from(TABLE)
    .select(
      "id,title,author,category,status,summary,body,views,tags,created_at,updated_at",
    )
    .order(SORT_COLUMN[sortKey], { ascending: sortDir === "asc" });

  if (query.category) {
    builder = builder.eq("category", query.category);
  }

  const q = query.q?.trim();
  if (q) {
    const needle = `%${escapeIlikeTerm(q)}%`;
    builder = builder.or(
      [
        `title.ilike.${needle}`,
        `author.ilike.${needle}`,
        `summary.ilike.${needle}`,
        `body.ilike.${needle}`,
      ].join(","),
    );
  }

  const { data, error } = await builder;
  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }
  return (data ?? []).map(rowToReport);
}

export async function getReportById(id: string): Promise<Report | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "id,title,author,category,status,summary,body,views,tags,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }
  return data ? rowToReport(data) : null;
}

export async function getAllReports(): Promise<Report[]> {
  return queryReports({});
}
