import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { AppBar } from '../components/Appbar/AppBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Excel Processor',
  description: 'Process your Excel files with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen ">
        <main className="flex flex-col">
          <AppBar />
          {children}
        </main>
      </body>
    </html>
  );
}
