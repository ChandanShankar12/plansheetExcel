import './globals.css';
import '@/styles/fonts.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { TitleBar } from '../components/TitleBar/TitleBar';
import { SpreadsheetProvider } from '@/hooks/spreadsheet-context';


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
      <head>
        <link
          rel="preload"
          href="/fonts/Inter-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Roboto-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Montserrat-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/OpenSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Lato-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="h-screen w-screen">
        <SpreadsheetProvider>
          <main className="flex flex-col h-screen w-screen">
            <TitleBar />
            <div className="flex-1">
              {children}
            </div>
          </main>
        </SpreadsheetProvider>
      </body>
    </html>
  );
}
