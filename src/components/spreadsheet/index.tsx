'use client';

import { Grid } from './grid';

export function Spreadsheet() {
  return (
    <div className="absolute inset-0 overflow-auto">
      <Grid />
    </div>
  );
}
