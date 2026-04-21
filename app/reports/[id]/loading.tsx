import styles from "../loading.module.scss";

export default function ReportDetailLoading() {
  return (
    <div className={styles.wrap} aria-busy="true">
      <div className={`${styles.skeleton} ${styles.short}`} />
      <div className={`${styles.skeleton} ${styles.long}`} />
      <div className={`${styles.skeleton} ${styles.medium}`} />
      <div className={`${styles.skeleton} ${styles.long}`} />
      <div className={`${styles.skeleton} ${styles.long}`} />
      <div className={`${styles.skeleton} ${styles.medium}`} />
    </div>
  );
}
