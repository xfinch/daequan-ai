'use client';

import { skillMetadata, getSkillDisplayName } from '@/lib/skills';

interface SkillsGridProps {
  stats: Array<{
    _id: string;
    totalUses: number;
    todayUses: number;
    lastUsed?: string;
  }>;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Never';
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

export function SkillsGrid({ stats }: SkillsGridProps) {
  // Merge metadata with stats
  const skills = Object.entries(skillMetadata).map(([id, meta]) => {
    const stat = stats.find(s => s._id === id);
    return {
      id,
      ...meta,
      totalUses: stat?.totalUses || 0,
      todayUses: stat?.todayUses || 0,
      lastUsed: stat?.lastUsed,
    };
  }).sort((a, b) => b.totalUses - a.totalUses);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill) => (
        <div 
          key={skill.id}
          className="bg-card border border-border rounded-xl p-5 hover:border-accent transition-all hover:-translate-y-0.5 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform" />
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center text-2xl">
              {skill.icon}
            </div>
            <div>
              <div className="font-semibold">{getSkillDisplayName(skill.id)}</div>
              <div className="text-xs text-muted uppercase">{skill.type} Skill</div>
            </div>
          </div>
          
          <p className="text-sm text-muted mb-4 line-clamp-2">{skill.description}</p>
          
          <div className="flex gap-6 pt-4 border-t border-border">
            <div>
              <div className="text-xl font-bold">{skill.totalUses}</div>
              <div className="text-xs text-muted uppercase">Total Uses</div>
            </div>
            <div>
              <div className="text-xl font-bold">{skill.todayUses}</div>
              <div className="text-xs text-muted uppercase">Today</div>
            </div>
            <div>
              <div className="text-sm font-bold">{formatRelativeTime(skill.lastUsed)}</div>
              <div className="text-xs text-muted uppercase">Last Used</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
