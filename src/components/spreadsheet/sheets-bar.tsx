'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useRef, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';

/**
 * SheetsBar component displays a bar of sheet tabs and an add sheet button
 */
export function SheetsBar() {
  const { sheets, activeSheet, addSheet, switchSheet } = useSpreadsheet();

  const handleAddSheet = useCallback(async () => {
    const nextNumber = sheets.length + 1;
    await addSheet(`Sheet ${nextNumber}`);
  }, [addSheet, sheets.length]);

  return (
    <div className="flex items-center h-[24px] bg-[#f8f9fa] border-t border-[#e1e3e6]">
      <div className="flex flex-1">
        {sheets.map((sheet) => (
          <div
            key={sheet.getId()}
            className={`
              relative flex items-center h-[24px] px-3
              cursor-pointer select-none border-r border-[#e1e3e6]
              ${activeSheet?.getId() === sheet.getId() 
                ? 'bg-white' 
                : 'bg-[#f8f9fa] hover:bg-gray-100'
              }
            `}
            onClick={() => switchSheet(sheet)}
          >
            <span className="text-[12px] text-gray-700">{sheet.getName()}</span>
            {activeSheet?.getId() === sheet.getId() && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#107c41]" />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAddSheet}
        className="w-[24px] h-[24px] flex items-center justify-center border-l border-[#e1e3e6] hover:bg-gray-100"
        aria-label="Add new sheet"
      >
        <Plus className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
