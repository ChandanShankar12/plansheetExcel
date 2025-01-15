'use client';

import { Grid } from './grid';
import { Toolbar } from './toolbar';

export function Spreadsheet() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <Toolbar />
      </header>
      <main className="flex-1 overflow-auto">
        <Grid />
      </main>
    </div>
  );
} 