'use client';

import { useState } from 'react';
import { KanbanBoard } from './kanban-board';

interface KanbanBoardWrapperProps {
  initialTab: string;
}

export function KanbanBoardWrapper({ initialTab }: KanbanBoardWrapperProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'ttl', label: '🚀 TTL' },
    { id: 'comcast', label: '📡 Comcast' },
    { id: 'personal', label: '👤 Personal' },
  ];

  return (
    <>
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
    </>
  );
}
