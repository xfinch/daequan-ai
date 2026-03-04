'use client';

import { useEffect, useState } from 'react';

interface KanbanItem {
  title?: string;
  priority?: string;
  description?: string;
  client?: string;
  project?: string;
  status?: string;
  lastContact?: string;
  nextAction?: string;
}

interface KanbanData {
  title: string;
  internal: {
    backlog: KanbanItem[];
    active: KanbanItem[];
    completed: KanbanItem[];
  };
  client: {
    pipeline: KanbanItem[];
    active: KanbanItem[];
    completed: KanbanItem[];
  };
}

interface KanbanBoardProps {
  type: string;
}

function getPriorityColor(priority?: string): string {
  if (!priority) return 'bg-muted/20 text-muted';
  const p = priority.toLowerCase();
  if (p.includes('high')) return 'bg-error/20 text-error';
  if (p.includes('medium')) return 'bg-warning/20 text-warning';
  return 'bg-muted/20 text-muted';
}

function getStatusColor(status?: string): string {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s.includes('warming')) return 'bg-warning/15 text-warning';
  if (s.includes('active') || s.includes('operational')) return 'bg-success/15 text-success';
  if (s.includes('blocked')) return 'bg-error/15 text-error';
  return 'bg-muted/15 text-muted';
}

export function KanbanBoard({ type }: KanbanBoardProps) {
  const [data, setData] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/kanban?type=${type}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) {
    return <div className="text-center py-12 text-muted">Loading board...</div>;
  }

  if (!data || data.error || !data.internal) {
    return <div className="text-center py-12 text-error">Failed to load board</div>;
  }

  return (
    <div className="space-y-8">
      {/* Internal Projects */}
      {(data.internal.backlog.length > 0 || data.internal.active.length > 0 || data.internal.completed.length > 0) && (
        <section>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 pb-2 border-b border-border">
            🏢 Internal Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Column title="Backlog" count={data.internal.backlog.length} dotColor="bg-muted">
              {data.internal.backlog.map((item, i) => (
                <Card key={i}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="font-medium text-sm">{item.title}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{item.description}</p>
                </Card>
              ))}
            </Column>
            
            <Column title="Active" count={data.internal.active.length} dotColor="bg-accent">
              {data.internal.active.map((item, i) => (
                <Card key={i}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="font-medium text-sm">{item.title}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{item.description}</p>
                </Card>
              ))}
            </Column>
            
            <Column title="Completed" count={data.internal.completed.length} dotColor="bg-success">
              {data.internal.completed.map((item, i) => (
                <Card key={i} className="opacity-70">
                  <div className="font-medium text-sm mb-1">{item.title}</div>
                  <p className="text-sm text-muted">{item.description}</p>
                </Card>
              ))}
            </Column>
          </div>
        </section>
      )}

      {/* Client Projects */}
      {(data.client.pipeline.length > 0 || data.client.active.length > 0 || data.client.completed.length > 0) && (
        <section>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 pb-2 border-b border-border">
            👥 Client Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Column title="Pipeline" count={data.client.pipeline.length} dotColor="bg-warning">
              {data.client.pipeline.map((item, i) => (
                <Card key={i}>
                  <div className="font-medium text-sm mb-1">{item.client}</div>
                  <p className="text-sm text-muted mb-2">{item.project}</p>
                  {item.status && (
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                </Card>
              ))}
            </Column>
            
            <Column title="Active" count={data.client.active.length} dotColor="bg-accent">
              {data.client.active.map((item, i) => (
                <Card key={i}>
                  <div className="font-medium text-sm mb-1">{item.client}</div>
                  <p className="text-sm text-muted mb-2">{item.project}</p>
                  {item.status && (
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                  {item.nextAction && (
                    <div className="text-xs text-muted mt-2">👉 {item.nextAction}</div>
                  )}
                </Card>
              ))}
            </Column>
            
            <Column title="Completed" count={data.client.completed.length} dotColor="bg-success">
              {data.client.completed.map((item, i) => (
                <Card key={i} className="opacity-70">
                  <div className="font-medium text-sm mb-1">{item.client}</div>
                  <p className="text-sm text-muted">{item.project}</p>
                </Card>
              ))}
            </Column>
          </div>
        </section>
      )}
    </div>
  );
}

function Column({ title, count, dotColor, children }: { 
  title: string; 
  count: number; 
  dotColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <div className="font-semibold text-sm">{title}</div>
        <div className="ml-auto bg-hover text-muted text-xs px-2 py-0.5 rounded-full font-semibold">
          {count}
        </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-background border border-border rounded-lg p-3 hover:border-accent transition-colors ${className}`}>
      {children}
    </div>
  );
}
