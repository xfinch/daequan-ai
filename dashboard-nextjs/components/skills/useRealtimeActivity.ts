'use client';

import { useEffect, useState, useCallback } from 'react';

interface Activity {
  _id: string;
  skillId: string;
  skillName: string;
  action: string;
  detail?: string;
  status: 'success' | 'warning' | 'error';
  createdAt: string;
}

export function useRealtimeActivity(initialData: Activity[] = []) {
  const [activities, setActivities] = useState<Activity[]>(initialData);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/skills/usage/stream');
    
    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_activity') {
          setActivities(prev => {
            const newActivity = data.data;
            // Prevent duplicates
            if (prev.some(a => a._id === newActivity._id)) {
              return prev;
            }
            // Add to front, keep max 20
            const updated = [newActivity, ...prev];
            return updated.slice(0, 20);
          });
        } else if (data.type === 'heartbeat') {
          // Connection is alive
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };
    
    eventSource.onerror = () => {
      setConnected(false);
      setError('Connection lost. Retrying...');
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  return { activities, connected, error };
}

export function formatRelativeTime(dateStr: string): string {
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
