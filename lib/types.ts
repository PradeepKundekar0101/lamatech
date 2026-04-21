export type ReportStatus = "draft" | "in_review" | "published" | "archived";

export type ReportCategory =
  | "growth"
  | "engineering"
  | "finance"
  | "product"
  | "research";

export interface Report {
  id: string;
  title: string;
  author: string;
  category: ReportCategory;
  status: ReportStatus;
  summary: string;
  body: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type SortKey = "createdAt" | "updatedAt" | "title" | "views";
export type SortDir = "asc" | "desc";

export interface ListReportsQuery {
  q?: string;
  sort?: SortKey;
  dir?: SortDir;
  category?: ReportCategory;
}

export type Role = "admin" | "viewer" | "guest";
