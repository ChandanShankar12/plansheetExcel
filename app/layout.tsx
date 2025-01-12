import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="en" className="sans">
      <body className="min-h-screen bg-neutralColor">
        <main className="flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}