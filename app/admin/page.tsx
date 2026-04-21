import { getCurrentRole } from "@/lib/auth.server";
import { getAllReports } from "@/lib/data/reports";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const role = await getCurrentRole();
  const reports = getAllReports();

  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Admin</p>
        <h1 className={styles.title}>Reports control plane</h1>
        <p className={styles.subtitle}>
          You&apos;re here because middleware verified your role
          (<code className={styles.code}>{role}</code>) before this server
          component ever rendered.
        </p>
      </header>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th className={styles.numeric}>Views</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td className={styles.mono}>{r.id}</td>
              <td>{r.title}</td>
              <td>{r.author}</td>
              <td>
                <span className={styles.status} data-status={r.status}>
                  {r.status.replace("_", " ")}
                </span>
              </td>
              <td className={styles.numeric}>{r.views.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
