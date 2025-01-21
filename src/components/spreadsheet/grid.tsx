'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { evaluateFormula } from '@/lib/spreadsheet';

export function Grid() {
  const { activeCell, setActiveCell, data } = useSpreadsheetContext();

  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="relative w-full">
      {/* Header row */}
      <div className="sticky top-0 z-10 flex bg-white">
        <div className="sticky left-0 z-20 w-[35px] shrink-0 bg-white border-r border-b" />
        {columns.map((col) => (
          <div key={col} className="w-[80px] shrink-0 border-r border-b p-1 text-center text-xs">
            {col}
          </div>
        ))}
      </div>

      {/* Grid content */}
      <div className="flex">
        {/* Row numbers */}
        <div className="sticky left-0 z-10 bg-white">
          {rows.map((row) => (
            <div key={row} className="w-[35px] h-[20px] shrink-0 border-r border-b flex items-center justify-center text-xs">
              {row}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="flex-1">
          {rows.map((row) => (
            <div key={row} className="flex">
              {columns.map((col) => {
                const cellId = `${col}${row}`;
                const cellData = data[cellId];
                const displayValue = cellData?.value ? evaluateFormula(cellData.value, data) : '';
                
                return (
                  <div
                    key={cellId}
                    className={`w-[80px] h-[20px] shrink-0 border-r border-b p-1 text-xs
                      ${activeCell === cellId ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => setActiveCell(cellId)}
                  >
                    {displayValue}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 