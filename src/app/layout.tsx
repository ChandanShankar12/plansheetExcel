import './globals.css';
import type { Metadata } from 'next';
import { AppBar } from '../components/appbar/AppBar';
import localFont from 'next/font/local';

const inter = localFont({
  src: '../../public/fonts/Inter-Regular.ttf',
  display: 'swap',
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
    <html lang="en">
      <body className={`min-h-screen ${inter.className}`}>
        <main className="flex flex-col">
          <AppBar />
          {children}
        </main>
      </body>
    </html>
  );
}
