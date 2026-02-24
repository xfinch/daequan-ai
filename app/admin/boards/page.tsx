import { AdminNav } from '@/components/admin/admin-nav';
import { KanbanBoardWrapper } from '@/components/kanban/kanban-board-wrapper';
import { auth } from '@/lib/auth-server';

interface PageProps {
  searchParams: { tab?: string };
}

export default async function BoardsPage({ searchParams }: PageProps) {
  const session = await auth();
  const activeTab = searchParams.tab || 'ttl';

  return (
    <>
      <AdminNav activePage="boards" user={session?.user} />
      <main className="max-w-7xl mx-auto p-6">
        <KanbanBoardWrapper initialTab={activeTab} />
      </main>
    </>
  );
}
