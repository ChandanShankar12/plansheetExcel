'use client';

import { ProjectBar } from './projectbar';
import { Sheet } from './sheet';
import { SheetsBar } from './sheets-bar';
import { AppStatusBar } from './appstatus-bar';
import { Toolbar } from './toolbar';

export function Spreadsheet() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ProjectBar />
      <div className="border-b border-[#e1e3e6] shrink-0">
        <Toolbar />
      </div>
      <div className="flex-1 min-h-0 relative bg-white">
        <Sheet />
      </div>
      <div className="shrink-0">
        <SheetsBar />
        <AppStatusBar />
      </div>
    </div>
  );
}
