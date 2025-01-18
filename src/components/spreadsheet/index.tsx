'use client';

import { Toolbar } from './toolbar';
import { Grid } from './grid';
import { ProjectBar } from './projectbar';

export function Spreadsheet() {
  return (
    <div className="flex flex-col h-full">
      <ProjectBar />
      <Toolbar activeCell={null} data={null} setData={null} setFont={null} />
      <div className="flex-1 relative">
        <Grid />
      </div>
    </div>
  );
}
