

import './globals.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { TitleBar } from '../components/TitleBar/TitleBar';
import { AsideWrapper } from '@/components/Aside';

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
      <body className="h-screen w-screen">
        <main className="flex flex-col h-screen w-screen">
          <TitleBar />
          <AsideWrapper>{children}</AsideWrapper>
        </main>
      </body>
    </html>
  );
}
