"use client";

import { useEffect } from "react";
import styles from "./error.module.scss";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[reports] route error", error);
  }, [error]);

  return (
    <div className={styles.wrap} role="alert">
      <h1 className={styles.title}>Couldn&apos;t load reports</h1>
      <p className={styles.message}>{error.message}</p>
      <button type="button" onClick={reset} className={styles.button}>
        Try again
      </button>
    </div>
  );
}
