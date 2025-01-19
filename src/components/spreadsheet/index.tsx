'use client';

import { Grid } from './grid';

export function Spreadsheet() {
  return (
    <div className="relative overflow-hidden flex-1 flex-col justify-between  w-full h-[calc(100vh-22px)]">
      <Grid />
    </div>
  );
}
