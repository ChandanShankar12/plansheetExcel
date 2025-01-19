import './globals.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { TitleBar } from '@/components/TitleBar/TitleBar';

const inter = localFont({
  src: '../../public/fonts/Inter-Regular.ttf',
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
        <main className="flex flex-col justify-between h-screen">
          <TitleBar />
          {children}
        </main>
      </body>
    </html>
  );
}
