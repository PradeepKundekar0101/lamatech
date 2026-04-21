"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./SearchSortBar.module.scss";

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Last updated" },
  { value: "createdAt", label: "Created" },
  { value: "title", label: "Title" },
  { value: "views", label: "Views" },
] as const;

const DIR_OPTIONS = [
  { value: "desc", label: "Desc" },
  { value: "asc", label: "Asc" },
] as const;

export function SearchSortBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialQ = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "updatedAt";
  const dir = searchParams.get("dir") ?? "desc";

  const [query, setQuery] = useState(initialQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedQ = useRef(initialQ);

  const baseParams = useMemo(() => {
    const next = new URLSearchParams(searchParams.toString());
    return next;
  }, [searchParams]);

  function pushParams(next: URLSearchParams) {
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query === lastPushedQ.current) return;

    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(baseParams.toString());
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      lastPushedQ.current = query;
      pushParams(next);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function onSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(baseParams.toString());
    next.set("sort", event.target.value);
    pushParams(next);
  }

  function onDirChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(baseParams.toString());
    next.set("dir", event.target.value);
    pushParams(next);
  }

  function clear() {
    setQuery("");
    lastPushedQ.current = "";
    const next = new URLSearchParams(baseParams.toString());
    next.delete("q");
    pushParams(next);
  }

  return (
    <div
      className={styles.bar}
      role="search"
      aria-busy={isPending || undefined}
    >
      <div className={styles.field}>
        <label htmlFor="report-search" className={styles.srOnly}>
          Search reports
        </label>
        <input
          id="report-search"
          type="search"
          placeholder="Search reports, authors, tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className={styles.clear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.controls}>
        <label className={styles.control}>
          <span className={styles.controlLabel}>Sort</span>
          <select value={sort} onChange={onSortChange} className={styles.select}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>Order</span>
          <select value={dir} onChange={onDirChange} className={styles.select}>
            {DIR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isPending && (
        <span className={styles.indicator} aria-live="polite">
          Updating…
        </span>
      )}
    </div>
  );
}
