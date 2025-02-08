'use client';

import { useState } from 'react';
import { SpreadsheetProvider } from '@/context/spreadsheet-context';
import { Spreadsheet } from '@/components/spreadsheet';
import { ProjectBar } from '@/components/spreadsheet/projectbar';
import { Toolbar } from '@/components/spreadsheet/toolbar';
import { SheetsBar } from '@/components/spreadsheet/sheets-bar';
import { AppStatusBar } from '@/components/spreadsheet/appstatus-bar';
import { FloatingModal } from '@/components/ai/floating_modal';
import { Aside } from '@/components/Aside';
import SplashScreen from '@/components/SplashScreen';
import { Grid } from '@/components/spreadsheet/grid';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SpreadsheetProvider>
      <SplashScreen 
        isOpen={showSplash} 
        onClose={() => setShowSplash(false)} 
      />
      <div className="flex flex-col h-full max-h-full">
        {/* Main Content + Aside */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main Content */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col shrink-0 pt-4 gap-4 px-4">
              <ProjectBar />
              <div className="flex flex-col w-full gap-3">
                <Toolbar />
                <div className="bg-gray-200 h-[1px] w-full" />
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
          </div>

          {/* Aside */}
          <Aside />
        </div>

        {/* Floating Modal */}
        <FloatingModal isFloating={true} />
      </div>
    </SpreadsheetProvider>
  );
}
