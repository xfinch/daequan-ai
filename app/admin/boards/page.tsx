'use client';

import { useState } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { KanbanBoard } from '@/components/kanban/kanban-board';

interface PageProps {
  searchParams: { tab?: string };
}

export default function BoardsPage({ searchParams }: PageProps) {
  const [activeTab, setActiveTab] = useState(searchParams.tab || 'ttl');

  const tabs = [
    { id: 'ttl', label: '🚀 TTL' },
    { id: 'comcast', label: '📡 Comcast' },
    { id: 'personal', label: '👤 Personal' },
  ];

  return (
    <>
      <AdminNav activePage="boards" />
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'bg-card text-muted hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <KanbanBoard type={activeTab} />
      </main>
    </>
  );
}
