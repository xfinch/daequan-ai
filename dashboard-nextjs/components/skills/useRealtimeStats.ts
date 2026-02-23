'use client';

import { useEffect, useState } from 'react';

interface Stats {
  _id: string;
  name: string;
  totalUses: number;
  todayUses: number;
  successCount: number;
  lastUsed: string;
}

export function useRealtimeStats(initialData: Stats[] = [], refreshInterval = 5000) {
  const [stats, setStats] = useState<Stats[]>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/skills/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    // Initial fetch
    fetchStats();

    // Poll for updates
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Calculate totals
  const totals = stats.reduce((acc, s) => ({
    totalUses: acc.totalUses + (s.totalUses || 0),
    todayUses: acc.todayUses + (s.todayUses || 0),
    successCount: acc.successCount + (s.successCount || 0),
  }), { totalUses: 0, todayUses: 0, successCount: 0 });

  const successRate = totals.totalUses > 0 
    ? Math.round((totals.successCount / totals.totalUses) * 100) 
    : 0;

  return { stats, totals, successRate, lastUpdate };
}
