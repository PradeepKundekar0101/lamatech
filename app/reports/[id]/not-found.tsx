import Link from "next/link";
import styles from "./not-found.module.scss";

export default function ReportNotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.title}>Report not found</h1>
      <p className={styles.message}>
        We couldn&apos;t find a report with that id. It may have been archived or
        the link is wrong.
      </p>
      <Link href="/reports" className={styles.button}>
        Back to reports
      </Link>
    </div>
  );
}
