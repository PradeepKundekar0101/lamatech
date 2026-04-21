import Link from "next/link";
import type { Role } from "@/lib/types";
import { RoleSwitcher } from "./RoleSwitcher";
import styles from "./SiteHeader.module.scss";

interface SiteHeaderProps {
  role: Role;
}

export function SiteHeader({ role }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden />
          <span className={styles.brandText}>Trail</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link href="/reports" className={styles.navLink}>
            Reports
          </Link>
          <Link href="/admin" className={styles.navLink}>
            Admin
          </Link>
        </nav>

        <RoleSwitcher role={role} />
      </div>
    </header>
  );
}
