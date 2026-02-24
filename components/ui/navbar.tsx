import Link from 'next/link';
import { auth } from '@/lib/auth';
import { handleSignOut } from '@/lib/actions';

export async function Navbar() {
  const session = await auth();
  const isAuthenticated = !!session;
  const user = session?.user;
  const userRole = (user as any)?.role;

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-accent text-lg">
            🎯 Daequan AI
          </Link>
          <Link href="/comcast" className="text-muted hover:text-foreground transition-colors">
            Comcast Map
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-muted text-sm">{user?.name}</span>
              {userRole === 'admin' || userRole === 'superadmin' ? (
                <Link 
                  href="/admin/skills" 
                  className="text-sm text-foreground hover:text-accent transition-colors"
                >
                  Admin
                </Link>
              ) : null}
              <form action={handleSignOut}>
                <button 
                  type="submit"
                  className="text-sm text-error hover:text-red-400 transition-colors"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link 
              href="/login" 
              className="text-sm text-foreground hover:text-accent transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
