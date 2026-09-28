import React from 'react';
import styles from './OpenProgramSkeleton.module.css';

export const OpenProgramSkeleton: React.FC = () => {
  return (
    <div className={styles.card} aria-hidden="true">
      <div>
        <div className={styles.header}>
          <div className={`${styles.badgeSkeleton} ${styles.shimmer}`} />
          <div className={`${styles.badgeSkeleton} ${styles.shimmer}`} />
        </div>

        <div className={`${styles.codeSkeleton} ${styles.shimmer}`} />
        <div className={`${styles.titleSkeleton} ${styles.shimmer}`} />
        <div className={`${styles.descSkeleton1} ${styles.shimmer}`} />
        <div className={`${styles.descSkeleton2} ${styles.shimmer}`} />

        <div className={styles.metaGrid}>
          <div className={`${styles.metaSkeleton} ${styles.shimmer}`} />
          <div className={`${styles.metaSkeleton} ${styles.shimmer}`} />
          <div className={`${styles.metaSkeleton} ${styles.shimmer}`} style={{ gridColumn: 'span 2' }} />
        </div>
      </div>

      <div className={`${styles.btnSkeleton} ${styles.shimmer}`} />
    </div>
  );
};
