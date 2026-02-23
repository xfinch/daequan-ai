'use client';

import { useEffect, useState } from 'react';
import { skillMetadata } from '@/lib/skills';

interface Activity {
  _id: string;
  skillId: string;
  skillName: string;
  action: string;
  detail?: string;
  status: 'success' | 'warning' | 'error';
  createdAt: string;
}

interface ActivityFeedProps {
  initialData: Activity[];
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '✕';
    default: return '•';
  }
}

export function ActivityFeed({ initialData }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialData);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Set up SSE connection
    const eventSource = new EventSource('/api/skills/usage/stream');
    
    eventSource.onopen = () => setConnected(true);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_activity') {
          setActivities(prev => {
            const newActivity = data.data;
            if (prev.some(a => a._id === newActivity._id)) return prev;
            return [newActivity, ...prev].slice(0, 20);
          });
        }
      } catch (err) {
        console.error('Error parsing SSE:', err);
      }
    };
    
    eventSource.onerror = () => setConnected(false);
    
    return () => eventSource.close();
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="font-semibold">Recent Activity</span>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-error'}`} />
          {connected ? 'Live' : 'Reconnecting...'}
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <div className="text-4xl mb-3">📭</div>
            <p>No recent activity</p>
            <p className="text-sm mt-1">Skills will appear here when used</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const meta = skillMetadata[activity.skillId];
            const icon = meta?.icon || '🔧';
            const statusClass = activity.status || 'success';
            
            return (
              <div 
                key={activity._id}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-hover/50 transition-colors ${index === 0 ? 'bg-accent/5' : ''}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                  statusClass === 'success' ? 'bg-success/15 text-success' :
                  statusClass === 'warning' ? 'bg-warning/15 text-warning' :
                  'bg-error/15 text-error'
                }`}>
                  {getStatusIcon(activity.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{activity.action}</div>
                  <div className="flex gap-4 text-sm text-muted flex-wrap">
                    <span>{icon} {activity.skillName || activity.skillId}</span>
                    {activity.detail && <span>{activity.detail}</span>}
                  </div>
                </div>
                
                <div className="text-sm text-muted whitespace-nowrap">
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
