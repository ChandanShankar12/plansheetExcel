'use client';

import { SpreadsheetProvider } from '@/context/spreadsheet-context';
import { Spreadsheet } from '@/components/spreadsheet';
import SplashScreen from '@/components/SplashScreen';
import { Slider } from '@/components/ui/slider';

export default function HomePage() {
  return (
    <div className="flex flex-col w-screen h-screen">
      <SpreadsheetProvider>
        {/* Splash Screen */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <SplashScreen isOpen={true} height={584} width={624} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col w-screen h-screen">
          <Spreadsheet />

          {/* Status Bar */}
          <div className="flex flex-row justify-between bg-primaryColor h-[22px] items-center">
            <div className="flex flex-row gap-4 px-4">
              <span className="text-white text-[10px]">Rows: {`Rows here`}</span>
              <span className="text-white text-[10px]">
                Columns: {`Columns here`}
              </span>
            </div>
            <div className="w-[200px] px-4">
              <Slider
                defaultValue={[50, 50]}
                orientation="horizontal"
                min={1}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>
      </SpreadsheetProvider>
    </div>
  );
}
