"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Role } from "@/lib/types";
import { ROLE_COOKIE } from "@/lib/auth";
import styles from "./SiteHeader.module.scss";

interface RoleSwitcherProps {
  role: Role;
}

const ROLES: Role[] = ["guest", "viewer", "admin"];

export function RoleSwitcher({ role }: RoleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setRole(next: Role) {
    document.cookie = `${ROLE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className={styles.roleSwitcher} aria-label="Demo role selector">
      <span className={styles.roleLabel}>Role</span>
      <div className={styles.roleGroup} role="radiogroup">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={role === r}
            disabled={isPending}
            onClick={() => setRole(r)}
            className={`${styles.roleButton} ${role === r ? styles.roleButtonActive : ""}`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
