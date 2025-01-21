

import { SpreadsheetProvider } from '@/context/spreadsheet-context';
import { Spreadsheet } from '@/components/spreadsheet';
import { ProjectBar } from '@/components/spreadsheet/projectbar';
import { Toolbar } from '@/components/spreadsheet/toolbar';
import { SheetsBar } from '@/components/spreadsheet/sheets-bar';
import { AppStatusBar } from '@/components/spreadsheet/appstatus-bar';
import { FloatingModal } from '@/components/ai/floating_modal';

export default function Page() {
  return (
    <SpreadsheetProvider>
      <div className="flex flex-col h-full min-h-0 bg-white">
        {/* Header */}
        <div className="flex flex-col shrink-0 pt-4 gap-4 mx-4">
          <ProjectBar />
          <div className="flex flex-col w-full gap-3">
            <Toolbar />
            <div className="bg-black h-[1px] w-full" />
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 min-h-0 relative">
          <Spreadsheet />
        </div>

        {/* Footer */}
        <div className="shrink-0">
          <div className="h-7 bg-[#F8FCF9] flex items-center">
            <SheetsBar />
          </div>
          <div className="h-6 bg-[#166534] text-white flex items-center text-xs">
            <AppStatusBar />
          </div>
        </div>

        {/* Floating Modal */}
        <FloatingModal isFloating={true} />
      </div>
    </SpreadsheetProvider>
  );
}
