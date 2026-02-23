import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daequan AI',
  description: 'Your director, right-hand, and operational authority',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
