import './globals.css';
import '@/styles/fonts.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { TitleBar } from '@/components/TitleBar/TitleBar';
import { SpreadsheetProvider } from '@/context/spreadsheet-context';


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
    <html lang="en" className={inter.variable}>
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
      <body className="h-screen w-screen overflow-hidden bg-white">
        <SpreadsheetProvider>
          <div className="flex flex-col h-screen min-h-0">
            <TitleBar className="shrink-0" />
            <div className="flex-1 min-h-0 overflow-hidden">
              {children}
            </div>
          </div>
        </SpreadsheetProvider>
      </body>
    </html>
  );
}
