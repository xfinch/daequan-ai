import { NextRequest } from 'next/server';
import { SkillUsage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skillId = searchParams.get('skillId');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const matchStage = skillId ? { skillId } : {};
    
    const stats = await SkillUsage.aggregate([
      { $match: matchStage },
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
    
    return Response.json({ stats });
  } catch (err) {
    console.error('Error fetching skill stats:', err);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
