import { Suspense } from 'react';
import { SkillUsage } from '@/lib/db';
import { StatsCards } from '@/components/skills/StatsCards';
import { SkillsGrid } from '@/components/skills/SkillsGrid';
import { ActivityFeed } from '@/components/skills/ActivityFeed';
import styles from './page.module.css';

// Server-side data fetching
async function getInitialStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await SkillUsage.aggregate([
      {
        $group: {
          _id: '$skillId',
          name: { $first: '$skillName' },
          totalUses: { $sum: 1 },
          todayUses: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', today] }, 1, 0]
            }
          },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          lastUsed: { $max: '$createdAt' }
        }
      },
      { $sort: { totalUses: -1 } }
    ]);
    
    return stats;
  } catch (err) {
    console.error('Error fetching stats:', err);
    return [];
  }
}

async function getInitialActivity() {
  try {
    const usage = await SkillUsage.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    return usage.map(u => ({
      ...u,
      _id: u._id.toString(),
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('Error fetching activity:', err);
    return [];
  }
}

function LoadingCard() {
  return (
    <div className={styles.loadingCard}>
      <div className={styles.skeleton} style={{ height: '100px' }} />
    </div>
  );
}

export default async function SkillsDashboard() {
  const [initialStats, initialActivity] = await Promise.all([
    getInitialStats(),
    getInitialActivity(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎯 Daequan Admin</h1>
        <nav className={styles.nav}>
          <a href="/admin">Overview</a>
          <a href="/admin/skills" className={styles.active}>Skills</a>
          <a href="/admin/decisions">Decisions</a>
          <a href="/admin/users">Users</a>
        </nav>
        <div className={styles.status}>
          <span className={styles.statusText}>System Online</span>
          <span className={styles.statusBadge}>Active</span>
        </div>
      </header>

      <main className={styles.container}>
        {/* Stats Row - Client Component with live updates */}
        <Suspense fallback={
          <div className={styles.grid3}>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        }>
          <StatsCards initialStats={initialStats} />
        </Suspense>

        {/* Skills Grid - Client Component with polling updates */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📦 Available Skills</h2>
            <span className={styles.sectionMeta}>Updates every 5s</span>
          </div>
          <Suspense fallback={<div className={styles.skeleton} style={{ height: '400px' }} />}>
            <SkillsGrid initialStats={initialStats} />
          </Suspense>
        </section>

        {/* Activity Feed - Client Component with SSE real-time updates */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📊 Recent Activity</h2>
            <span className={styles.sectionMeta}>Real-time updates</span>
          </div>
          <Suspense fallback={<LoadingCard />}>
            <ActivityFeed initialData={initialActivity} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
