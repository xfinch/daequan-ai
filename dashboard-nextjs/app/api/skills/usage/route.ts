import { NextRequest } from 'next/server';
import { SkillUsage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const skillId = searchParams.get('skillId');
  
  try {
    const query = skillId ? { skillId } : {};
    const usage = await SkillUsage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return Response.json({ usage, count: usage.length });
  } catch (err) {
    console.error('Error fetching skill usage:', err);
    return Response.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
