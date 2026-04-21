import Link from "next/link";
import { getAllReports } from "@/lib/data/reports";
import styles from "./page.module.scss";

export default function HomePage() {
  const reports = getAllReports();
  const totalViews = reports.reduce((sum, r) => sum + r.views, 0);
  const published = reports.filter((r) => r.status === "published").length;

  return (
    <div className={styles.hero}>
      <div className={styles.eyebrow}>Trail trial task</div>
      <h1 className={styles.title}>
        A small reports console, built with the Trail stack.
      </h1>
      <p className={styles.lede}>
        Next.js App Router · TypeScript · SCSS modules · server-driven search
        and sort · middleware-gated admin · AI-generated summaries with proper
        loading and error states.
      </p>

      <div className={styles.actions}>
        <Link href="/reports" className={styles.primary}>
          Browse reports →
        </Link>
        <Link href="/admin" className={styles.secondary}>
          Try the role-gated admin
        </Link>
      </div>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Reports</dt>
          <dd>{reports.length}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Published</dt>
          <dd>{published}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Total views</dt>
          <dd>{totalViews.toLocaleString()}</dd>
        </div>
      </dl>
    </div>
  );
}
