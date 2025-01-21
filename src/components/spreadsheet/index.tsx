'use client';

import { Grid } from './grid';

export function Spreadsheet() {
  return (
    <div className="absolute inset-0 overflow-auto">
      <div className="min-w-max">
        <Grid />
      </div>
    </div>
  );
}
