import Link from "next/link";
import type { Report } from "@/lib/types";
import styles from "./ReportCard.module.scss";

interface ReportCardProps {
  report: Report;
  href?: string;
}

const STATUS_LABEL: Record<Report["status"], string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  archived: "Archived",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const numberFormatter = new Intl.NumberFormat("en-US");

export function ReportCard({ report, href }: ReportCardProps) {
  const target = href ?? `/reports/${report.id}`;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span
          className={styles.status}
          data-status={report.status}
          aria-label={`Status: ${STATUS_LABEL[report.status]}`}
        >
          {STATUS_LABEL[report.status]}
        </span>
        <span className={styles.category}>{report.category}</span>
      </header>

      <h2 className={styles.title}>
        <Link href={target} className={styles.titleLink}>
          {report.title}
        </Link>
      </h2>

      <p className={styles.summary}>{report.summary}</p>

      <footer className={styles.footer}>
        <span className={styles.author}>{report.author}</span>
        <span className={styles.dot} aria-hidden>
          ·
        </span>
        <time dateTime={report.updatedAt} className={styles.meta}>
          Updated {dateFormatter.format(new Date(report.updatedAt))}
        </time>
        <span className={styles.dot} aria-hidden>
          ·
        </span>
        <span className={styles.meta}>
          {numberFormatter.format(report.views)} views
        </span>
      </footer>
    </article>
  );
}
