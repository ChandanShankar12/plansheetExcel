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
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="flex flex-col border-b border-gray-200">
          <ProjectBar />
          <Toolbar />
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto">
          <Spreadsheet />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200">
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
