'use client';

import { SpreadsheetProvider } from '@/context/spreadsheet-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpreadsheetProvider>
      {children}
    </SpreadsheetProvider>
  );
} 