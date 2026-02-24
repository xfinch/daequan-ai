import Link from 'next/link';
import { auth } from '@/lib/auth';
import { handleSignOut } from '@/lib/actions';

interface AdminNavProps {
  activePage?: 'skills' | 'boards' | 'decisions' | 'users';
}

export async function AdminNav({ activePage }: AdminNavProps) {
  const session = await auth();
  const user = session?.user;

  const navItems = [
    { href: '/admin/skills', label: 'Skills', id: 'skills' },
    { href: '/admin/boards', label: 'Boards', id: 'boards' },
    { href: '/admin/overview', label: 'Decisions', id: 'decisions' },
    { href: '/admin/users', label: 'Users', id: 'users' },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-accent text-lg">
            🎯 Daequan Admin
          </Link>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activePage === item.id
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-foreground hover:bg-hover'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            ← Main Site
          </Link>
          <span className="text-muted">|</span>
          <span className="text-muted text-sm">{user?.name}</span>
          <form action={handleSignOut}>
            <button 
              type="submit"
              className="text-sm text-error hover:text-red-400 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
