import { AdminNav } from '@/components/admin/admin-nav';
import { connectDB, SkillUsage } from '@/lib/db';
import { skillMetadata } from '@/lib/skills';
import { StatsCards } from '@/components/admin/stats-cards';
import { SkillsGrid } from '@/components/admin/skills-grid';
import { ActivityFeed } from '@/components/admin/activity-feed';
import { auth } from '@/lib/auth-server';

async function getSkillStats() {
  await connectDB();
  
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
}

async function getRecentActivity() {
  await connectDB();
  
  const activity = await SkillUsage.find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  
  return activity.map((a: any) => ({
    ...a,
    _id: a._id.toString(),
    createdAt: a.createdAt.toISOString(),
  }));
}

export default async function SkillsPage() {
  const session = await auth();
  const [stats, activity] = await Promise.all([
    getSkillStats(),
    getRecentActivity(),
  ]);

  return (
    <>
      <AdminNav activePage="skills" user={session?.user} />
      <main className="max-w-7xl mx-auto p-6">
        <StatsCards stats={stats} />
        
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📦 Available Skills</h2>
            <span className="text-sm text-muted">Updates every 5s</span>
          </div>
          <SkillsGrid stats={stats} />
        </section>
        
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📊 Recent Activity</h2>
            <span className="text-sm text-muted">Real-time updates</span>
          </div>
          <ActivityFeed initialData={activity} />
        </section>
      </main>
    </>
  );
}
