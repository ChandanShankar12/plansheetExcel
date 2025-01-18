'use client';

import { SpreadsheetProvider } from '../context/spreadsheet-context';
import { Spreadsheet } from '../components/spreadsheet';
import SplashScreen from '../components/SplashScreen';

export default function Page() {
  return (
    <div className="w-full h-screen">
      <div className="relative flex items-center justify-center w-full h-full">
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <SplashScreen isOpen={true} height={584} width={624} />
        </div>
        <div className="relative z-10 w-full h-full">
          <SpreadsheetProvider>
            <Spreadsheet />
          </SpreadsheetProvider>
        </div>
      </div>
    </div>
  );
}
