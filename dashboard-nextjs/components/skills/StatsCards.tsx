'use client';

import { skillMetadata } from '@/lib/skills';
import { useRealtimeStats } from './useRealtimeStats';
import styles from './StatsCards.module.css';

interface Stats {
  _id: string;
  name: string;
  totalUses: number;
  todayUses: number;
  successCount: number;
  lastUsed: string;
}

export function StatsCards({ initialStats }: { initialStats: Stats[] }) {
  const { totals, successRate, lastUpdate } = useRealtimeStats(initialStats);
  const totalSkills = Object.keys(skillMetadata).length;

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Active Skills</span>
          <span className={`${styles.tag} ${styles.tagInfo}`}>Live</span>
        </div>
        <div className={styles.cardValue}>{totalSkills}</div>
        <div className={styles.cardDelta}>2 custom + 12 system</div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Today's Executions</span>
          <span className={`${styles.tag} ${styles.tagSuccess}`}>Live</span>
        </div>
        <div className={styles.cardValue}>{totals.todayUses}</div>
        <div className={styles.cardDelta}>Skill invocations today</div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Success Rate</span>
          <span className={`${styles.tag} ${styles.tagSuccess}`}>Healthy</span>
        </div>
        <div className={styles.cardValue}>{successRate}%</div>
        <div className={styles.cardDelta}>All time average</div>
      </div>
    </div>
  );
}
