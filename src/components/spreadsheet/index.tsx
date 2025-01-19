'use client';

import { Toolbar } from './toolbar';
import { Grid } from './grid';
import { ProjectBar } from './projectbar';

export function Spreadsheet() {
  return (
    <div className="relative flex flex-col justify-between h-full w-full">
      <div className="flex flex-row justify-between w-full">
        <ProjectBar />
      </div>
      <div className='w-full'>
        <Toolbar />
      </div>
      <div className="flex-1 relative">
        <Grid />
      </div>
    </div>
  );
}
