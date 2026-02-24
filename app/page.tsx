import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session;

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 Daequan AI</h1>
          <p className="text-gray-600 mb-8">Your director, right-hand, and operational authority</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <span className="text-gray-700">Chat with Daequan</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <span className="text-gray-700">Task Assignment</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <span className="text-gray-700">Skill Building</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <span className="text-gray-700">Results Delivery</span>
            </div>
          </div>
          
          {isAuthenticated ? (
            <div className="flex gap-3 justify-center">
              <Link 
                href="/admin/skills"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <Link 
              href="/login"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Sign in with Google
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
