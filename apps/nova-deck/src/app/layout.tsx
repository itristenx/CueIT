import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nova Deck - Universe Launcher',
  description: 'Unified launcher and dashboard for Nova Universe applications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
