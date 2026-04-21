import Link from "next/link";
import { notFound } from "next/navigation";
import { AiSummary } from "@/components/AiSummary/AiSummary";
import { getRequestBaseUrl } from "@/lib/url";
import type { Report } from "@/lib/types";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

const numberFormatter = new Intl.NumberFormat("en-US");

async function fetchReport(id: string): Promise<Report | null> {
  const base = await getRequestBaseUrl();
  const res = await fetch(`${base}/api/reports/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load report (${res.status})`);
  }
  const json = (await res.json()) as { report: Report };
  return json.report;
}

export default async function ReportDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const report = await fetchReport(id);
  if (!report) notFound();

  return (
    <article className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/reports">← All reports</Link>
      </nav>

      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.category}>{report.category}</span>
          <span className={styles.dot} aria-hidden>
            ·
          </span>
          <span>{report.author}</span>
          <span className={styles.dot} aria-hidden>
            ·
          </span>
          <time dateTime={report.updatedAt}>
            Updated {dateFormatter.format(new Date(report.updatedAt))}
          </time>
        </div>
        <h1 className={styles.title}>{report.title}</h1>
        <p className={styles.summary}>{report.summary}</p>
        <div className={styles.tags}>
          {report.tags.map((t) => (
            <span key={t} className={styles.tag}>
              #{t}
            </span>
          ))}
        </div>
      </header>

      <AiSummary reportId={report.id} />

      <section className={styles.bodySection} aria-labelledby="body-heading">
        <h2 id="body-heading" className={styles.sectionTitle}>
          Full report
        </h2>
        <div className={styles.body}>{report.body}</div>
      </section>

      <aside className={styles.stats}>
        <div>
          <span className={styles.statLabel}>Status</span>
          <span className={styles.statValue}>{report.status.replace("_", " ")}</span>
        </div>
        <div>
          <span className={styles.statLabel}>Views</span>
          <span className={styles.statValue}>{numberFormatter.format(report.views)}</span>
        </div>
        <div>
          <span className={styles.statLabel}>Created</span>
          <span className={styles.statValue}>
            {dateFormatter.format(new Date(report.createdAt))}
          </span>
        </div>
      </aside>
    </article>
  );
}
