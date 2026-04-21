import styles from "./loading.module.scss";

export default function ReportsLoading() {
  return (
    <div className={styles.wrap} aria-busy="true">
      <div className={styles.headSkeleton}>
        <div className={`${styles.skeleton} ${styles.short}`} />
        <div className={`${styles.skeleton} ${styles.medium}`} />
      </div>
      <div className={`${styles.skeleton} ${styles.bar}`} />
      <ul className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className={styles.cardSkeleton}>
            <div className={`${styles.skeleton} ${styles.short}`} />
            <div className={`${styles.skeleton} ${styles.long}`} />
            <div className={`${styles.skeleton} ${styles.medium}`} />
            <div className={`${styles.skeleton} ${styles.medium}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
