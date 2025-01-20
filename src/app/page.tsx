'use client';

import { SpreadsheetProvider } from '@/context/spreadsheet-context';
import { Spreadsheet } from '@/components/spreadsheet';
import { ProjectBar } from '@/components/spreadsheet/projectbar';
import { Toolbar } from '@/components/spreadsheet/toolbar';
import { SheetsBar } from '@/components/spreadsheet/sheets-bar';
import { AppStatusBar } from '@/components/spreadsheet/appstatus-bar';

export default function Page() {
  return (
    <SpreadsheetProvider>
      <div className="flex flex-col h-[calc(100vh-32px)] bg-white">
        {/* Header */}
        <div className="flex flex-col shrink-0 pt-4 gap-4 px-4">
          <ProjectBar />
          <div className="mx-4 mb-1">
            <Toolbar />
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 relative min-h-0">
          <Spreadsheet />
        </div>

        {/* Footer */}
        <div className="shrink-0">
          {/* Sheet Tabs */}
          <div className="h-7 bg-[#F8FCF9] flex items-center">
            <SheetsBar />
          </div>
          {/* Status Bar */}
          <div className="h-6 bg-[#166534] text-white flex items-center text-xs">
            <AppStatusBar />
          </div>
        </div>
      </div>
    </SpreadsheetProvider>
  );
}
