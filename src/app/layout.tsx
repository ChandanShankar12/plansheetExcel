import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { TitleBar } from '@/components/TitleBar/TitleBar';
import { memo } from 'react';
import { SpreadsheetProvider } from '@/context/spreadsheet-context';

// Use Next.js built-in font optimization instead of static files
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Memoize the layout content
const LayoutContent = memo(function LayoutContent({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen min-h-0">
      <TitleBar />
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
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
    <html lang="en" className={inter.variable}>
      <body className="h-screen w-screen overflow-hidden bg-white">
        <SpreadsheetProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </SpreadsheetProvider>
      </body>
    </html>
  );
}
