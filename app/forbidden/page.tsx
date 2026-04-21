import Link from "next/link";
import { getCurrentRole } from "@/lib/auth.server";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

interface ForbiddenPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function ForbiddenPage({ searchParams }: ForbiddenPageProps) {
  const role = await getCurrentRole();
  const { from } = await searchParams;

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>403 — Forbidden</p>
      <h1 className={styles.title}>You don&apos;t have access to that page.</h1>
      <p className={styles.message}>
        {from ? (
          <>
            <code className={styles.code}>{from}</code> is restricted to admins.
          </>
        ) : (
          "This area is restricted to admins."
        )}{" "}
        Your current role is <code className={styles.code}>{role}</code>. Use
        the role switcher in the header to sign in as an admin.
      </p>
      <Link href="/" className={styles.button}>
        Back to home
      </Link>
    </div>
  );
}
