'use client';

interface StatsProps {
  stats: Array<{
    _id: string;
    totalUses: number;
    todayUses: number;
    successCount: number;
  }>;
}

export function StatsCards({ stats }: StatsProps) {
  const totalSkills = 14; // Total available skills
  const todayUses = stats.reduce((sum, s) => sum + (s.todayUses || 0), 0);
  const totalUses = stats.reduce((sum, s) => sum + (s.totalUses || 0), 0);
  const successCount = stats.reduce((sum, s) => sum + (s.successCount || 0), 0);
  const successRate = totalUses > 0 ? Math.round((successCount / totalUses) * 100) : 0;

  const cards = [
    { label: 'Active Skills', value: totalSkills, subtext: '2 custom + 12 system', tag: 'Live', tagColor: 'bg-accent/20 text-accent' },
    { label: "Today's Executions", value: todayUses, subtext: 'Skill invocations today', tag: 'Live', tagColor: 'bg-success/20 text-success' },
    { label: 'Success Rate', value: `${successRate}%`, subtext: 'All time average', tag: 'Healthy', tagColor: 'bg-success/20 text-success' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div 
          key={card.label}
          className="bg-card border border-border rounded-xl p-6 hover:border-accent transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-muted uppercase tracking-wider">
              {card.label}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${card.tagColor}`}>
              {card.tag}
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">{card.value}</div>
          <div className="text-sm text-muted">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
