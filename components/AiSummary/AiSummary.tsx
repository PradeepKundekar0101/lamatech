"use client";

import { useEffect, useState, useTransition } from "react";
import type { AiSummary as AiSummaryPayload } from "@/lib/ai";
import styles from "./AiSummary.module.scss";

interface AiSummaryProps {
  reportId: string;
  autoLoad?: boolean;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; summary: AiSummaryPayload };

export function AiSummary({ reportId, autoLoad = true }: AiSummaryProps) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [, startTransition] = useTransition();

  async function load() {
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/reports/${reportId}/summary`, {
        method: "POST",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? `Request failed (${res.status})`);
      }
      startTransition(() => {
        setState({ kind: "ready", summary: json.summary });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ kind: "error", message });
    }
  }

  useEffect(() => {
    if (!autoLoad) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, autoLoad]);

  return (
    <section className={styles.wrap} aria-labelledby="ai-summary-heading">
      <header className={styles.header}>
        <div>
          <h2 id="ai-summary-heading" className={styles.title}>
            AI summary
          </h2>
          <p className={styles.subtitle}>
            Generated on demand. Treat as a draft.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={state.kind === "loading"}
          className={styles.regenerate}
        >
          {state.kind === "loading" ? "Generating…" : "Regenerate"}
        </button>
      </header>

      {state.kind === "idle" && (
        <button type="button" onClick={load} className={styles.cta}>
          Generate summary
        </button>
      )}

      {state.kind === "loading" && (
        <div className={styles.skeletonGroup} aria-busy="true" aria-live="polite">
          <div className={`${styles.skeleton} ${styles.line}`} />
          <div className={`${styles.skeleton} ${styles.lineShort}`} />
          <div className={`${styles.skeleton} ${styles.line}`} />
          <div className={`${styles.skeleton} ${styles.lineShort}`} />
        </div>
      )}

      {state.kind === "error" && (
        <div className={styles.error} role="alert">
          <p className={styles.errorTitle}>Couldn&apos;t generate a summary</p>
          <p className={styles.errorMessage}>{state.message}</p>
          <button type="button" onClick={load} className={styles.retry}>
            Try again
          </button>
        </div>
      )}

      {state.kind === "ready" && (
        <div className={styles.body}>
          <p className={styles.text}>{state.summary.text}</p>
          {state.summary.bullets.length > 0 && (
            <ul className={styles.bullets}>
              {state.summary.bullets.map((b, idx) => (
                <li key={idx}>{b.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ul>
          )}
          <p className={styles.meta}>
            {state.summary.model} · generated{" "}
            {new Date(state.summary.generatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </section>
  );
}
