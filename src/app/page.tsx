'use client';

import { SpreadsheetProvider } from '@/context/spreadsheet-context';
import { Spreadsheet } from '@/components/spreadsheet';
import SplashScreen from '@/components/SplashScreen';
import { Slider } from '@/components/ui/slider';
import { ProjectBar } from '@/components/spreadsheet/projectbar';
import { Toolbar } from '@/components/spreadsheet/toolbar';

export default function Sheets() {
  return (
    <div className="flex flex-col justify-between w-screen h-screen">
      
        <div className="flex flex-row w-full ">
          <ProjectBar />
        </div>

        <div className="flex flex-row w-full h-full">
          <Toolbar
            activeCell={null}
            data={{}}
            setData={() => {}}
            setFont={() => {}}
          />
        </div>
     

      <div className="flex flex-row w-full h-full">
        <SpreadsheetProvider>
          <Spreadsheet />
        </SpreadsheetProvider>
      </div>

      {/* Status Bar */}
      <div className="relative flex flex-row justify-between bg-primaryColor h-[22px] items-center">
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
  );
}
