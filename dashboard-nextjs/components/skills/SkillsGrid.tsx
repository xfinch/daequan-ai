'use client';

import { skillMetadata, getSkillDisplayName } from '@/lib/skills';
import { useRealtimeStats } from './useRealtimeStats';
import styles from './SkillsGrid.module.css';

interface Stats {
  _id: string;
  name: string;
  totalUses: number;
  todayUses: number;
  successCount: number;
  lastUsed: string;
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr || dateStr === 'Never') return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function SkillsGrid({ initialStats }: { initialStats: Stats[] }) {
  const { stats } = useRealtimeStats(initialStats);

  // Merge metadata with stats
  const skills = Object.entries(skillMetadata).map(([id, meta]) => {
    const stat = stats.find(s => s._id === id);
    return {
      id,
      ...meta,
      totalUses: stat?.totalUses || 0,
      todayUses: stat?.todayUses || 0,
      lastUsed: stat?.lastUsed || null,
    };
  }).sort((a, b) => b.totalUses - a.totalUses);

  return (
    <div className={styles.grid}>
      {skills.map(skill => (
        <div key={skill.id} className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>{skill.icon}</div>
            <div>
              <div className={styles.name}>{getSkillDisplayName(skill.id)}</div>
              <div className={styles.type}>{skill.type} Skill</div>
            </div>
          </div>
          <div className={styles.description}>{skill.description}</div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{skill.totalUses}</span>
              <span className={styles.statLabel}>Total Uses</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{skill.todayUses}</span>
              <span className={styles.statLabel}>Today</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ fontSize: '0.875rem' }}>
                {formatRelativeTime(skill.lastUsed || '')}
              </span>
              <span className={styles.statLabel}>Last Used</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
