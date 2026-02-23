'use client';

import { skillMetadata } from '@/lib/skills';
import { useRealtimeActivity, formatRelativeTime } from './useRealtimeActivity';
import styles from './ActivityFeed.module.css';

interface Activity {
  _id: string;
  skillId: string;
  skillName: string;
  action: string;
  detail?: string;
  status: 'success' | 'warning' | 'error';
  createdAt: string;
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '✕';
    default: return '•';
  }
}

export function ActivityFeed({ initialData }: { initialData: Activity[] }) {
  const { activities, connected } = useRealtimeActivity(initialData);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Recent Activity</span>
        <div className={styles.connectionStatus}>
          <span className={`${styles.dot} ${connected ? styles.connected : styles.disconnected}`} />
          {connected ? 'Live' : 'Reconnecting...'}
        </div>
      </div>
      
      <div className={styles.list}>
        {activities.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <p>No recent activity</p>
            <p className={styles.emptySubtext}>Skills will appear here when used</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const meta = skillMetadata[activity.skillId];
            const icon = meta?.icon || '🔧';
            const statusClass = activity.status || 'success';
            const isNew = index === 0;
            
            return (
              <div 
                key={activity._id} 
                className={`${styles.item} ${isNew ? styles.new : ''}`}
              >
                <div className={`${styles.statusIcon} ${styles[statusClass]}`}>
                  {getStatusIcon(activity.status)}
                </div>
                <div className={styles.content}>
                  <div className={styles.action}>{activity.action}</div>
                  <div className={styles.meta}>
                    <span>{icon} {activity.skillName || activity.skillId}</span>
                    <span>{activity.detail || ''}</span>
                  </div>
                </div>
                <div className={styles.time}>
                  {formatRelativeTime(activity.createdAt)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
